// server.js
const express = require('express')
const axios = require('axios')
const { createClient } = require('@supabase/supabase-js')

const app = express()
app.use(express.json({ limit: '10mb' }))

// Configure com suas credenciais Supabase (service_role key)
const supabase = createClient(
  'https://ovncoamtrycpyqagavvi.supabase.co',
  'SUA_SERVICE_ROLE_KEY_AQUI' // Chave service_role obrigatória para upload privado
)

app.post('/upload', async (req, res) => {
  try {
    const imageUrl = req.body?.imageUrl || req.query?.imageUrl
    if (!imageUrl) return res.status(400).json({ error: 'imageUrl é obrigatório' })

    // Baixa imagem da URL fornecida
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(response.data, 'binary')

    // Gera nome único para arquivo
    const fileName = `arquivos/${Date.now()}.png`

    // Upload para Supabase Storage
    const { error } = await supabase.storage
      .from('uploads')
      .upload(fileName, buffer, {
        contentType: 'image/png'
      })

    if (error) return res.status(500).json({ error: error.message })

    // Obter URL pública do arquivo
    const { data } = supabase.storage.from('uploads').getPublicUrl(fileName)

    return res.json({ publicUrl: data.publicUrl })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// Porta padrão para Render, Railway, etc.
const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`Middleware rodando na porta ${PORT}`)
})