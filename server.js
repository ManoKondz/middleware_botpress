const express = require('express')
const multer = require('multer')
const fs = require('fs')
const { createClient } = require('@supabase/supabase-js')

const app = express()
const upload = multer({ dest: 'uploads/' })

// Dados fixos do Supabase
const supabase = createClient(
  'https://ovncoamtrycpyqagavvi.supabase.co',
  'sb_publishable_tSmAKhJJiwE4y0hXmtS38w_IutyGpmg' // Publishable key, serve só pra testes
)

app.post('/upload', upload.single('arquivo'), async (req, res) => {
  const file = req.file
  const caminho = `arquivos/${Date.now()}_${file.originalname}`
  const buffer = fs.readFileSync(file.path)

  const { error } = await supabase
    .storage
    .from('uploads')
    .upload(caminho, buffer, {
      contentType: file.mimetype
    })

  fs.unlinkSync(file.path)

  if (error) {
    return res.status(500).json({ erro: error.message })
  }

  const { data } = supabase
    .storage
    .from('uploads')
    .getPublicUrl(caminho)

  res.json({ url: data.publicUrl })
})

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000')
})
