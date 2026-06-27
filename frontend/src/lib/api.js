const BASE_URL = import.meta.env.VITE_API_URL || ''

export async function rankCandidates({ jdText, jdFile, candidateFiles, candidateTexts }) {
  const form = new FormData()

  if (jdFile) {
    form.append('jd_file', jdFile)
  } else if (jdText) {
    form.append('jd_text', jdText)
  }

  if (candidateFiles && candidateFiles.length > 0) {
    for (const f of candidateFiles) {
      form.append('candidate_files', f)
    }
  }

  if (candidateTexts && candidateTexts.length > 0) {
    const valid = candidateTexts.filter(c => c.text && c.text.trim())
    if (valid.length > 0) {
      form.append('candidate_texts', JSON.stringify(valid))
    }
  }

  const res = await fetch(`${BASE_URL}/api/rank`, {
    method: 'POST',
    body: form,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || `Request failed with status ${res.status}`)
  }

  return res.json()
}

export async function exportCSV(results) {
  const res = await fetch(`${BASE_URL}/api/export/csv`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(results),
  })

  if (!res.ok) throw new Error('Export failed')

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'talentiq_shortlist.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}