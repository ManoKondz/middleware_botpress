// server.js
const express = require('express')
const axios = require('axios')
const cors = require('cors')
const { createClient } = require('@supabase/supabase-js')

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' })) // aceita JSON grande

// Configurar Supabase client - use service_role key para produção
const supabase = createClient(
  'https://ovncoamtrycpyqagavvi.supabase.co',
  'sb_publishable_tSmAKhJJiwE4y0hXmtS38w_IutyGpmg' // substitua pela service_role para produção segura
)

app.post('/upload', async (req, res) => {
  const { imageUrl } = req.body
  if (!imageUrl) {
    return res.status(400).json({ error: 'imageUrl é obrigatório' })
  }

  try {
    console.log('Recebendo imageUrl:', imageUrl)

    // Baixa a imagem da URL
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(response.data, 'binary')

    const fileName = `arquivos/${Date.now()}.png`

    // Upload para Supabase Storage
    const { error } = await supabase.storage
      .from('uploads')
      .upload(fileName, buffer, {
        contentType: 'image/png'
      })

    if (error) {
      console.error('Erro ao fazer upload no Supabase:', error)
      return res.status(500).json({ error: error.message })
    }

    // Obtem URL pública
    const { data } = supabase.storage.from('uploads').getPublicUrl(fileName)

    console.log('Upload bem-sucedido:', data.publicUrl)
    return res.json({ url: data.publicUrl })

  } catch (err) {
    console.error('Erro no processamento do upload:', err)
    return res.status(500).json({ error: err.message })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Middleware rodando na porta ${PORT}`)
})
