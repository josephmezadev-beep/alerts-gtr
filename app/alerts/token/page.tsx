"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel, FieldDescription, FieldGroup } from "@/components/ui/field"
import { Key, Save, Trash2, Eye, EyeOff, CheckCircle2 } from "lucide-react"

export default function TokenPage() {
  const [authorization, setAuthorization] = useState("")
  const [profileAuthorization, setProfileAuthorization] = useState("")
  const [showAuth, setShowAuth] = useState(false)
  const [showProfileAuth, setShowProfileAuth] = useState(false)
  const [saved, setSaved] = useState(false)
  const [hasTokens, setHasTokens] = useState(false)

  useEffect(() => {
    // Load existing tokens from localStorage
    const storedAuth = localStorage.getItem("authorization") || ""
    const storedProfileAuth = localStorage.getItem("profile-authorization") || ""
    setAuthorization(storedAuth)
    setProfileAuthorization(storedProfileAuth)
    setHasTokens(!!(storedAuth && storedProfileAuth))
  }, [])

  const handleSave = () => {
    localStorage.setItem("authorization", authorization)
    localStorage.setItem("profile-authorization", profileAuthorization)
    setSaved(true)
    setHasTokens(!!(authorization && profileAuthorization))
    setTimeout(() => setSaved(false), 3000)
  }

  const handleClear = () => {
    localStorage.removeItem("authorization")
    localStorage.removeItem("profile-authorization")
    setAuthorization("")
    setProfileAuthorization("")
    setHasTokens(false)
  }

  return (
    <div className="relative z-10 p-8 max-w-2xl mx-auto">
      <Card className="border-cyan-500/20 bg-slate-900/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400/20 to-blue-500/20">
              <Key className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <CardTitle className="text-xl text-foreground">API Tokens</CardTitle>
              <CardDescription>
                Configure authentication tokens for API requests
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <FieldGroup className="gap-6">
            <Field>
              <FieldLabel htmlFor="authorization" className="text-foreground">
                Authorization Token
              </FieldLabel>
              <FieldDescription>
                Bearer token for the Authorization header
              </FieldDescription>
              <div className="relative">
                <Input
                  id="authorization"
                  type={showAuth ? "text" : "password"}
                  value={authorization}
                  onChange={(e) => setAuthorization(e.target.value)}
                  placeholder="Bearer eyJhbGciOiJIUzI1NiIs..."
                  className="pr-10 bg-slate-800/50 border-slate-700 focus:border-cyan-500/50 text-foreground placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowAuth(!showAuth)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  {showAuth ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="profile-authorization" className="text-foreground">
                Profile Authorization Token
              </FieldLabel>
              <FieldDescription>
                Bearer token for the profile-authorization header
              </FieldDescription>
              <div className="relative">
                <Input
                  id="profile-authorization"
                  type={showProfileAuth ? "text" : "password"}
                  value={profileAuthorization}
                  onChange={(e) => setProfileAuthorization(e.target.value)}
                  placeholder="Bearer eyJhbGciOiJIUzI1NiIs..."
                  className="pr-10 bg-slate-800/50 border-slate-700 focus:border-cyan-500/50 text-foreground placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowProfileAuth(!showProfileAuth)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  {showProfileAuth ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSave}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-medium"
              >
                {saved ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Tokens
                  </>
                )}
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>

            {hasTokens && (
              <div className="flex items-center gap-2 p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-emerald-400">
                  Tokens are configured and ready to use
                </span>
              </div>
            )}
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  )
}
