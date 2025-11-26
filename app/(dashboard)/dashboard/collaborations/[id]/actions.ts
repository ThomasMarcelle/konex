'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitPost(collaborationId: string, linkedinPostUrl: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Non authentifié' }
  }

  // Verify the user is the creator of this collaboration
  const { data: collaboration } = await supabase
    .from('collaborations')
    .select(`
      id,
      status,
      applications:application_id (
        creator_profiles:creator_id (
          profile_id
        )
      )
    `)
    .eq('id', collaborationId)
    .single()

  if (!collaboration) {
    return { error: 'Collaboration non trouvée' }
  }

  if (collaboration.status !== 'active') {
    return { error: 'Cette collaboration n\'est plus active' }
  }

  const creatorProfileId = (collaboration.applications as any)?.creator_profiles?.profile_id
  if (creatorProfileId !== user.id) {
    return { error: 'Non autorisé' }
  }

  // Validate LinkedIn URL
  if (!linkedinPostUrl.includes('linkedin.com/')) {
    return { error: 'URL LinkedIn invalide' }
  }

  // Check if this URL was already submitted
  const { data: existingProof } = await supabase
    .from('publication_proofs')
    .select('id')
    .eq('collaboration_id', collaborationId)
    .eq('linkedin_post_url', linkedinPostUrl)
    .single()

  if (existingProof) {
    return { error: 'Ce post a déjà été soumis' }
  }

  // Create the proof
  const { error } = await supabase
    .from('publication_proofs')
    .insert({
      collaboration_id: collaborationId,
      linkedin_post_url: linkedinPostUrl,
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/collaborations/${collaborationId}`)
  return { success: true }
}

export async function validatePost(proofId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Non authentifié' }
  }

  // Get the proof and verify the user is the SaaS owner
  const { data: proof } = await supabase
    .from('publication_proofs')
    .select(`
      id,
      collaboration_id,
      collaborations:collaboration_id (
        applications:application_id (
          saas_companies:saas_id (
            profile_id
          )
        )
      )
    `)
    .eq('id', proofId)
    .single()

  if (!proof) {
    return { error: 'Preuve non trouvée' }
  }

  const saasProfileId = (proof.collaborations as any)?.applications?.saas_companies?.profile_id
  if (saasProfileId !== user.id) {
    return { error: 'Non autorisé' }
  }

  // Validate the proof
  const { error } = await supabase
    .from('publication_proofs')
    .update({
      validated: true,
      validated_at: new Date().toISOString(),
    })
    .eq('id', proofId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/collaborations/${proof.collaboration_id}`)
  return { success: true }
}

