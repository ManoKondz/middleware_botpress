// server.js
const express = require('express')
const axios = require('axios')
const cors = require('cors')
const { createClient } = require('@supabase/supabase-js')

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' })) // para aceitar JSON grande

// Supabase Client - use sua service_role key para upload privado
const supabase = createClient(
  'https://ovncoamtrycpyqagavvi.supabase.co',
  'sb_publishable_tSmAKhJJiwE4y0hXmtS38w_IutyGpmg' // Atenção: esta é a chave publishable. Ideal usar service_role em produção
)

app.post('/upload', async (req, res) => {
  const { imageUrl } = req.body
  if (!imageUrl) return res.status(400).json({ error: 'imageUrl é obrigatório' })

  try {
    // Baixa imagem da URL informada
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(response.data, 'binary')

    // Nome único para o arquivo no bucket
    const fileName = `arquivos/${Date.now()}.png`

    // Faz upload para Supabase Storage
    const { error } = await supabase.storage
      .from('uploads')
      .upload(fileName, buffer, {
        contentType: 'image/png'
      })

    if (error) return res.status(500).json({ error: error.message })

    // Pega URL pública do arquivo
    const { data } = supabase.storage.from('uploads').getPublicUrl(fileName)

    return res.json({ url: data.publicUrl })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Middleware rodando na porta ${PORT}`)
})
