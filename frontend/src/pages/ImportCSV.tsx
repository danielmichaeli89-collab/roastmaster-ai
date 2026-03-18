import React, { useState } from 'react'
import { Upload, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { Layout } from '../components'

interface PreviewRow {
  date?: string
  origin?: string
  batchNumber?: string
  duration?: string
  devPercent?: string
  score?: string
  [key: string]: any
}

export const ImportCSV: React.FC = () => {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<PreviewRow[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please select a CSV file')
      return
    }

    setFile(selectedFile)

    // Parse CSV for preview
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string
        const lines = csv.split('\n')
        const headers = lines[0].split(',').map((h) => h.trim())

        const previewRows: PreviewRow[] = lines.slice(1, 11).map((line) => {
          const values = line.split(',').map((v) => v.trim())
          const row: PreviewRow = {}
          headers.forEach((header, idx) => {
            row[header] = values[idx] || ''
          })
          return row
        })

        setPreview(previewRows.filter((row) => Object.values(row).some((v) => v)))
        toast.success(`CSV loaded: ${previewRows.length} rows found`)
      } catch (error) {
        toast.error('Failed to parse CSV file')
      }
    }
    reader.readAsText(selectedFile)
  }

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file first')
      return
    }

    try {
      setIsImporting(true)
      // Simulate import
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setImportSuccess(true)
      toast.success('Roast data imported successfully')
      setTimeout(() => {
        setFile(null)
        setPreview([])
        setImportSuccess(false)
      }, 3000)
    } catch (error) {
      toast.error('Failed to import data')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-accent-amber">Import Roast Data</h2>
          <p className="text-text-secondary mt-1">Import roasting logs from CSV files</p>
        </div>

        {!importSuccess ? (
          <div className="space-y-6">
            {/* Upload Zone */}
            <div className="bg-card rounded-xl border-2 border-dashed border-elevated p-12 text-center space-y-4 hover:border-accent-amber transition">
              <div className="flex justify-center">
                <Upload size={48} className="text-accent-amber/50" />
              </div>
              <div>
                <p className="text-text-primary font-semibold mb-2">Drag and drop your CSV file here</p>
                <p className="text-text-secondary text-sm mb-4">or click to browse</p>
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="inline-block">
                <button
                  onClick={() => document.getElementById('file-input')?.click()}
                  className="px-6 py-3 bg-accent-amber text-primary rounded-lg font-semibold hover:shadow-lg transition"
                >
                  Browse Files
                </button>
              </label>
              {file && (
                <p className="text-accent-gold text-sm">
                  Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            {/* Preview */}
            {preview.length > 0 && (
              <div className="bg-card rounded-xl border border-elevated p-6 space-y-4">
                <h3 className="text-lg font-bold text-accent-amber">Preview (First 10 rows)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-elevated">
                      <tr>
                        {Object.keys(preview[0] || {}).slice(0, 7).map((header) => (
                          <th key={header} className="text-left py-2 px-3 text-text-secondary">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(0, 5).map((row, idx) => (
                        <tr key={idx} className="border-b border-elevated/50 hover:bg-elevated/50">
                          {Object.values(row)
                            .slice(0, 7)
                            .map((value, vidx) => (
                              <td key={vidx} className="py-2 px-3 text-text-primary">
                                {String(value).slice(0, 30)}
                              </td>
                            ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Options */}
            {preview.length > 0 && (
              <div className="bg-card rounded-xl border border-elevated p-6 space-y-4">
                <h3 className="text-lg font-bold text-accent-amber">Import Options</h3>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Link to Coffee</label>
                  <select className="w-full px-4 py-2 bg-elevated text-text-primary rounded-lg border border-elevated focus:outline-none focus:ring-2 focus:ring-accent-amber">
                    <option value="">Auto-detect</option>
                    <option value="create">Create New</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Link to Profile</label>
                  <select className="w-full px-4 py-2 bg-elevated text-text-primary rounded-lg border border-elevated focus:outline-none focus:ring-2 focus:ring-accent-amber">
                    <option value="">Auto-detect</option>
                    <option value="none">None</option>
                  </select>
                </div>
              </div>
            )}

            {/* Import Button */}
            {file && (
              <button
                onClick={handleImport}
                disabled={isImporting}
                className="w-full px-6 py-3 bg-accent-amber text-primary rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isImporting ? 'Importing...' : 'Import Roast Log'}
              </button>
            )}
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-elevated p-12 text-center space-y-4">
            <div className="flex justify-center">
              <Check size={64} className="text-success" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary">Import Successful</h3>
            <p className="text-text-secondary">
              Successfully imported {preview.length} roast records
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default ImportCSV
