import { decodeJwt, jwtVerify, importJWK, importSPKI } from 'jose';
import {
  AlertCircle,
  Copy,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { type ChangeEvent, useCallback, useEffect, useState } from 'react';
import { Paste } from '~/components/shortcut';
import { ToolCard, ToolField, ToolHeader } from '~/components/tool';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import { useGlobalPaste } from '~/hooks/use-global-paste';
import type { Route } from './+types/home';

const description = 'Decode and inspect JSON Web Tokens (JWT)';

export function meta(_: Route.MetaArgs) {
  return [
    { title: 'JWT Decoder | Grug Tools' },
    { name: 'description', content: description },
  ];
}

type JWTPayload = {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  valid: boolean;
  error?: string;
  signatureValid?: boolean;
  validationError?: string;
};

function appDecodeJwt(token: string): JWTPayload {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format: must have exactly 3 parts');
    }

    const [, , signaturePart] = parts;

    const payload = decodeJwt(token);
    const headerPart = parts[0];
    const paddedHeader =
      headerPart + '='.repeat((4 - (headerPart.length % 4)) % 4);
    const base64Header = paddedHeader.replace(/-/g, '+').replace(/_/g, '/');
    const header = JSON.parse(atob(base64Header));

    return {
      header,
      payload,
      signature: signaturePart,
      valid: true,
    };
  } catch (error) {
    return {
      header: {},
      payload: {},
      signature: '',
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function formatTimestamp(timestamp: number | undefined): string {
  if (!timestamp) return 'N/A';
  try {
    return new Date(timestamp * 1000).toLocaleString();
  } catch {
    return 'Invalid timestamp';
  }
}

async function appVerifyJwt(
  token: string,
  algorithm: string,
  secret?: string,
  publicKey?: string,
): Promise<{ valid: boolean; error?: string }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let keyLike: any;

    if (algorithm.startsWith('HS')) {
      // HMAC algorithms - use secret
      if (!secret) {
        return { valid: false, error: 'Secret required for HMAC algorithms' };
      }
      keyLike = new TextEncoder().encode(secret);
    } else if (
      algorithm.startsWith('RS') ||
      algorithm.startsWith('ES') ||
      algorithm.startsWith('PS')
    ) {
      // RSA/ECDSA algorithms - use public key
      if (!publicKey) {
        return {
          valid: false,
          error: 'Public key required for RSA/ECDSA algorithms',
        };
      }

      try {
        // Try different key formats
        if (publicKey.startsWith('-----BEGIN')) {
          // PEM format
          keyLike = await importSPKI(publicKey, algorithm);
        } else {
          // Try as JWK
          const jwk = JSON.parse(publicKey);
          keyLike = await importJWK(jwk, algorithm);
        }
      } catch {
        return {
          valid: false,
          error: 'Invalid key format. Use PEM format or JWK.',
        };
      }
    } else {
      return { valid: false, error: `Unsupported algorithm: ${algorithm}` };
    }

    await jwtVerify(token, keyLike);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}

const DEFAULT_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

const DEFAULT_SECRET = 'your-256-bit-secret';

export default function JwtDecode() {
  const [token, setToken] = useState(DEFAULT_TOKEN);
  const [decodedJWT, setDecodedJwt] = useState<JWTPayload | null>(null);
  const [secret, setSecret] = useState(DEFAULT_SECRET);
  const [showSecret, setShowSecret] = useState(false);
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handlePaste = useCallback((pastedText: string) => {
    console.log({ pastedText });
    setToken(pastedText);
    const decoded = appDecodeJwt(pastedText);
    setDecodedJwt({
      ...decoded,
      signatureValid: undefined,
      validationError: undefined,
    });
  }, []);

  useGlobalPaste(handlePaste);

  function handleTokenChange(e: ChangeEvent<HTMLInputElement>) {
    const newToken = e.target.value;
    setToken(newToken);

    if (newToken.trim()) {
      const decoded = appDecodeJwt(newToken.trim());
      setDecodedJwt({
        ...decoded,
        signatureValid: undefined,
        validationError: undefined,
      });
    } else {
      setDecodedJwt(null);
    }
  }

  function handleCopyHeader() {
    if (decodedJWT) {
      navigator.clipboard.writeText(JSON.stringify(decodedJWT.header, null, 2));
    }
  }

  function handleCopyPayload() {
    if (decodedJWT) {
      navigator.clipboard.writeText(
        JSON.stringify(decodedJWT.payload, null, 2),
      );
    }
  }

  function getAlgorithmType(
    algorithm?: string,
  ): 'hmac' | 'asymmetric' | 'unknown' {
    if (!algorithm) return 'unknown';
    if (algorithm.startsWith('HS')) return 'hmac';
    if (
      algorithm.startsWith('RS') ||
      algorithm.startsWith('ES') ||
      algorithm.startsWith('PS')
    )
      return 'asymmetric';
    return 'unknown';
  }

  // Decode the default token on mount
  useEffect(() => {
    if (token.trim()) {
      const decoded = appDecodeJwt(token.trim());
      setDecodedJwt(decoded);
    }
  }, []);

  // Automatic validation when token, secret, or public key changes
  useEffect(() => {
    async function validateToken() {
      if (!decodedJWT || !decodedJWT.valid) return;

      const algorithm = decodedJWT.header.alg as string;
      if (!algorithm) {
        setDecodedJwt((prev) =>
          prev
            ? {
                ...prev,
                signatureValid: false,
                validationError: 'No algorithm specified in header',
              }
            : null,
        );
        return;
      }

      const algorithmType = getAlgorithmType(algorithm);

      // Only validate if we have the required key/secret
      if (algorithmType === 'hmac' && !secret) return;
      if (algorithmType === 'asymmetric' && !publicKey) return;
      if (algorithmType === 'unknown') return;

      setIsVerifying(true);
      try {
        const result = await appVerifyJwt(token, algorithm, secret, publicKey);
        setDecodedJwt((prev) =>
          prev
            ? {
                ...prev,
                signatureValid: result.valid,
                validationError: result.error,
              }
            : null,
        );
      } finally {
        setIsVerifying(false);
      }
    }

    validateToken();
  }, [token, secret, publicKey, decodedJWT?.valid, decodedJWT?.header.alg]);

  return (
    <>
      <ToolHeader title="JWT Decoder">
        <p>
          {description}. Paste an existing JWT with <Paste />
        </p>
      </ToolHeader>
      <div className="flex flex-col gap-4">
        {/* Decoder Section */}
        <ToolCard>
          <ToolHeader title="Decode JWT">
            Paste a JWT token to decode and inspect its contents
          </ToolHeader>
          <ToolField label="JWT Token">
            <Input
              value={token}
              onChange={handleTokenChange}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="font-mono text-sm"
            />
          </ToolField>

          {decodedJWT && !decodedJWT.valid && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-red-700 text-sm">{decodedJWT.error}</span>
            </div>
          )}
        </ToolCard>

        {/* Signature Verification */}
        {decodedJWT && decodedJWT.valid && (
          <ToolCard>
            <ToolHeader title="Signature Verification">
              Verify the JWT signature using a secret or public key
            </ToolHeader>

            {(() => {
              const algorithm = decodedJWT.header.alg as string;
              const algorithmType = getAlgorithmType(algorithm);

              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Algorithm:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      {algorithm || 'Unknown'}
                    </code>
                    {algorithmType === 'unknown' && (
                      <span className="text-amber-600">(Unsupported)</span>
                    )}
                  </div>

                  {algorithmType === 'hmac' && (
                    <ToolField label="Secret">
                      <div className="relative">
                        <Input
                          type={showSecret ? 'text' : 'password'}
                          value={secret}
                          onChange={(e) => setSecret(e.target.value)}
                          placeholder="Enter HMAC secret"
                          className="font-mono text-sm pr-10"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                          onClick={() => setShowSecret(!showSecret)}
                        >
                          {showSecret ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </ToolField>
                  )}

                  {algorithmType === 'asymmetric' && (
                    <div className="space-y-4">
                      <ToolField label="Public Key (for verification)">
                        <textarea
                          value={publicKey}
                          onChange={(e) => setPublicKey(e.target.value)}
                          placeholder='-----BEGIN PUBLIC KEY-----&#10;...&#10;-----END PUBLIC KEY-----&#10;&#10;or JWK format:&#10;{"kty":"RSA","n":"...","e":"AQAB"}'
                          className="w-full p-3 border border-gray-300 rounded-md font-mono text-xs min-h-32 resize-y"
                        />
                      </ToolField>
                      <ToolField label="Private Key (for signing)">
                        <textarea
                          value={privateKey}
                          onChange={(e) => setPrivateKey(e.target.value)}
                          placeholder='-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----&#10;&#10;or JWK format:&#10;{"kty":"RSA","d":"...","n":"...","e":"AQAB"}'
                          className="w-full p-3 border border-gray-300 rounded-md font-mono text-xs min-h-32 resize-y"
                        />
                      </ToolField>
                    </div>
                  )}

                  {algorithmType !== 'unknown' && (
                    <div className="flex items-center gap-4">
                      {isVerifying && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                          <span className="text-sm">
                            Verifying signature...
                          </span>
                        </div>
                      )}

                      {!isVerifying &&
                        decodedJWT.signatureValid !== undefined && (
                          <div className="flex items-center gap-2">
                            {decodedJWT.signatureValid ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-green-700 text-sm font-medium">
                                  Valid Signature
                                </span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 text-red-500" />
                                <span className="text-red-700 text-sm font-medium">
                                  Invalid Signature
                                </span>
                              </>
                            )}
                          </div>
                        )}

                      {!isVerifying &&
                        decodedJWT.signatureValid === undefined &&
                        algorithmType === 'hmac' &&
                        !secret && (
                          <span className="text-gray-500 text-sm">
                            Enter secret to verify signature
                          </span>
                        )}

                      {!isVerifying &&
                        decodedJWT.signatureValid === undefined &&
                        algorithmType === 'asymmetric' &&
                        !publicKey && (
                          <span className="text-gray-500 text-sm">
                            Enter public key to verify signature
                          </span>
                        )}
                    </div>
                  )}

                  {decodedJWT.validationError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-red-700 text-sm">
                        {decodedJWT.validationError}
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}
          </ToolCard>
        )}

        {/* Decoded Results */}
        {decodedJWT && decodedJWT.valid && (
          <ToolCard>
            <ToolHeader title="Decoded JWT">
              Header, payload, and signature information
            </ToolHeader>

            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Header</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyHeader}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy Header</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <pre className="bg-gray-50 p-3 rounded-md text-xs overflow-auto">
                {JSON.stringify(decodedJWT.header, null, 2)}
              </pre>
            </div>

            {/* Payload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Payload</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyPayload}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy Payload</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <pre className="bg-gray-50 p-3 rounded-md text-xs overflow-auto">
                {JSON.stringify(decodedJWT.payload, null, 2)}
              </pre>

              {/* Show common claims if present */}
              {(typeof decodedJWT.payload.exp === 'number' ||
                typeof decodedJWT.payload.iat === 'number' ||
                typeof decodedJWT.payload.nbf === 'number') && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  {typeof decodedJWT.payload.iat === 'number' && (
                    <div>
                      <span className="font-medium">Issued At:</span>
                      <br />
                      {formatTimestamp(decodedJWT.payload.iat)}
                    </div>
                  )}
                  {typeof decodedJWT.payload.exp === 'number' && (
                    <div>
                      <span className="font-medium">Expires At:</span>
                      <br />
                      {formatTimestamp(decodedJWT.payload.exp)}
                    </div>
                  )}
                  {typeof decodedJWT.payload.nbf === 'number' && (
                    <div>
                      <span className="font-medium">Not Before:</span>
                      <br />
                      {formatTimestamp(decodedJWT.payload.nbf)}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Signature */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Signature</Label>
              <pre className="bg-gray-50 p-3 rounded-md text-xs overflow-auto break-all">
                {decodedJWT.signature || 'No signature'}
              </pre>
            </div>
          </ToolCard>
        )}
      </div>
    </>
  );
}
