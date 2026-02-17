import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSpace } from '../../context/SpaceContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function CreateFirstSpace() {
  const { createSpace } = useSpace()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Space name is required')
      return
    }

    try {
      setLoading(true)
      await createSpace(name, description)
      navigate('/')
    } catch (err: any) {
      console.error('Error creating space:', err)
      setError(err.message || 'Failed to create space')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Create Your First Space</CardTitle>
          <CardDescription>
            Spaces help you organize photos with different groups of people
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Space Name *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Family Photos, Work Team, etc."
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="What's this space for?"
                  rows={3}
                  maxLength={200}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
              >
                {loading ? 'Creating space...' : 'Create Space'}
              </Button>

              <Button
                type="button"
                onClick={handleSkip}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                Skip for now
              </Button>
            </div>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">
            You can create a space later or join one through an invitation
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
