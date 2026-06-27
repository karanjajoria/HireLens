import axios from 'axios'

const api = axios.create({
  // Empty baseURL so Vite proxy handles /api/* → localhost:8000
  baseURL: '',
  timeout: 180000,
})

export async function rankCandidates({ jdText, jdFile, candidateFiles, candidateTexts }) {
  const form = new FormData()

  // JD — one or the other
  if (jdFile) {
    form.append('jd_file', jdFile)
  } else if (jdText) {
    form.append('jd_text', jdText)
  }

  // Candidate files — append each individually so backend gets a list
  if (candidateFiles && candidateFiles.length > 0) {
    for (const f of candidateFiles) {
      form.append('candidate_files', f)
    }
  }

  // Pasted candidate text — send as JSON string
  if (candidateTexts && candidateTexts.length > 0) {
    const valid = candidateTexts.filter(c => c.text && c.text.trim())
    if (valid.length > 0) {
      form.append('candidate_texts', JSON.stringify(valid))
    }
  }

  const res = await api.post('/api/rank', form)
  return res.data
}

export async function exportCSV(results) {
  const res = await api.post('/api/export/csv', results, {
    responseType: 'blob',
  })
  const url = URL.createObjectURL(res.data)
  const a = document.createElement('a')
  a.href = url
  a.download = 'talentiq_shortlist.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default api
