'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitPublicationProof(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Non authentifié' }
  }

  const collaborationId = formData.get('collaborationId') as string
  const linkedinPostUrl = formData.get('linkedinPostUrl') as string
  const screenshotUrl = formData.get('screenshotUrl') as string | null

  // Verify the user is the creator of this collaboration
  const { data: collaboration } = await supabase
    .from('collaborations')
    .select(`
      id,
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

  const creatorProfileId = (collaboration.applications as any)?.creator_profiles?.profile_id
  if (creatorProfileId !== user.id) {
    return { error: 'Non autorisé' }
  }

  // Create the proof
  const { error } = await supabase
    .from('publication_proofs')
    .insert({
      collaboration_id: collaborationId,
      linkedin_post_url: linkedinPostUrl,
      screenshot_url: screenshotUrl,
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/collaborations')
  return { success: true }
}

export async function validatePublicationProof(proofId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Non authentifié' }
  }

  // Get the proof and verify ownership
  const { data: proof } = await supabase
    .from('publication_proofs')
    .select(`
      id,
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

  revalidatePath('/dashboard/collaborations')
  return { success: true }
}

export async function completeCollaboration(collaborationId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Non authentifié' }
  }

  // Verify the user is the SaaS of this collaboration
  const { data: collaboration } = await supabase
    .from('collaborations')
    .select(`
      id,
      applications:application_id (
        saas_companies:saas_id (
          profile_id
        )
      )
    `)
    .eq('id', collaborationId)
    .single()

  if (!collaboration) {
    return { error: 'Collaboration non trouvée' }
  }

  const saasProfileId = (collaboration.applications as any)?.saas_companies?.profile_id
  if (saasProfileId !== user.id) {
    return { error: 'Non autorisé' }
  }

  // Update collaboration status
  const { error } = await supabase
    .from('collaborations')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', collaborationId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/collaborations')
  return { success: true }
}

export async function uploadProofScreenshot(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Non authentifié', url: null }
  }

  const file = formData.get('file') as File
  if (!file) {
    return { error: 'Aucun fichier fourni', url: null }
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/proof-${Date.now()}.${fileExt}`

  const { error, data } = await supabase.storage
    .from('screenshots')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    })

  if (error) {
    return { error: error.message, url: null }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('screenshots')
    .getPublicUrl(fileName)

  return { success: true, url: publicUrl }
}

