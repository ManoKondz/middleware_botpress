const express = require('express')
const multer = require('multer')
const fs = require('fs')
const cors = require('cors')
const { createClient } = require('@supabase/supabase-js')

const app = express()
app.use(cors())
const upload = multer({ dest: 'uploads/' })

const supabase = createClient(
  'https://ovncoamtrycpyqagavvi.supabase.co',
  'sb_publishable_tSmAKhJJiwE4y0hXmtS38w_IutyGpmg'
)

app.post('/upload', upload.single('arquivo'), async (req, res) => {
  try {
    const file = req.file
    if (!file) return res.status(400).json({ erro: 'Arquivo não enviado' })

    const caminhoNoBucket = `arquivos/${Date.now()}_${file.originalname}`
    const fileBuffer = fs.readFileSync(file.path)

    const { error } = await supabase.storage
      .from('uploads')
      .upload(caminhoNoBucket, fileBuffer, {
        contentType: file.mimetype,
      })

    fs.unlinkSync(file.path)

    if (error) return res.status(500).json({ erro: error.message })

    const { data } = supabase.storage
      .from('uploads')
      .getPublicUrl(caminhoNoBucket)

    return res.json({ url: data.publicUrl })
  } catch (err) {
    return res.status(500).json({ erro: err.message })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})
