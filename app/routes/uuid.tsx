import { ClipboardPaste, Copy } from 'lucide-react';
import { type ChangeEvent, useEffect, useState } from 'react';
import short from 'short-uuid';
import { v1 as uuidV1, v4 as uuidV4, v6 as uuidV6, v7 as uuidV7 } from 'uuid';
import { Shortcut } from '~/components/shortcut';
import { ToolCard, ToolField, ToolHeader, ToolRow } from '~/components/tool';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import type { Route } from './+types/home';

const description = 'Generate UUIDs and convert between different bases';

export function meta(_: Route.MetaArgs) {
  return [
    { title: 'UUID Tool | Grug Tools' },
    { name: 'description', content: description },
  ];
}

const base58Translator = short();
const base36Translator = short(short.constants.uuid25Base36);
const base90Translator = short(short.constants.cookieBase90);

function detectBase(input: string): string {
  const trimmed = input.trim();

  // Check for hex UUID format (with hyphens)
  if (
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      trimmed,
    )
  ) {
    return 'hex';
  }

  // Check for hex UUID format (without hyphens)
  if (/^[0-9a-fA-F]{32}$/.test(trimmed)) {
    return 'hex';
  }

  // Check for base58 (Bitcoin alphabet, no 0, O, I, l)
  if (
    /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/.test(
      trimmed,
    ) &&
    trimmed.length < 32
  ) {
    return 'base58';
  }

  // Check for base36 (0-9, a-z)
  if (/^[0-9a-zA-Z]+$/.test(trimmed) && trimmed.length < 32) {
    return 'base36';
  }

  // Default to hex if we can't determine
  return 'hex';
}

export default function Uuid() {
  const [version, setVersion] = useState('v4');
  const [uuid, setUuid] = useState('');

  function generate(v: string) {
    if (v === 'v1') {
      setUuid(uuidV1());
    } else if (v === 'v4') {
      setUuid(uuidV4());
    } else if (v === 'v6') {
      setUuid(uuidV6());
    } else {
      setUuid(uuidV7());
    }
  }

  function handleChangeVersion(v: string) {
    setVersion(v);
    generate(v);
  }

  function handleGenerate() {
    generate(version);
  }

  function handleChangeUuid(e: ChangeEvent<HTMLInputElement>) {
    setUuid(e.target.value);
  }

  function handleCopy() {
    navigator.clipboard.writeText(uuid);
  }

  function handleCopyBase58() {
    navigator.clipboard.writeText(base58Translator.fromUUID(uuid));
  }
  function handleCopyBase36() {
    navigator.clipboard.writeText(base36Translator.fromUUID(uuid));
  }
  function handleCopyBase90() {
    navigator.clipboard.writeText(base90Translator.fromUUID(uuid));
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      const detectedBase = detectBase(text);

      if (detectedBase === 'hex') {
        setUuid(text);
      } else if (detectedBase === 'base58') {
        setUuid(base58Translator.toUUID(text));
      } else if (detectedBase === 'base36') {
        setUuid(base36Translator.toUUID(text));
      }
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        event.preventDefault();
        handlePaste();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => handleGenerate(), []);

  return (
    <>
      <ToolHeader title="UUID Tool">
        <p>
          {description}. Paste an existing UUID with{' '}
          <Shortcut keys={['mod', 'v']} />.
        </p>
      </ToolHeader>
      <div className="flex flex-col gap-4">
        <ToolCard>
          <ToolHeader title="Generate UUID">
            Choose a UUID version and generate a new identifier
          </ToolHeader>
          <ToolRow>
            <ToolField label="Version">
              <Select value={version} onValueChange={handleChangeVersion}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="v1">UUID v1 (Timestamp)</SelectItem>
                  <SelectItem value="v4">UUID v4 (Random)</SelectItem>
                  <SelectItem value="v6">
                    UUID v6 (Timestamp, reordered)
                  </SelectItem>
                  <SelectItem value="v7">UUID v7 (Unix Timestamp)</SelectItem>
                </SelectContent>
              </Select>
            </ToolField>
            <Button onClick={handleGenerate}>Generate</Button>
          </ToolRow>
          <ToolRow>
            <ToolField label="UUID">
              <Input value={uuid} onChange={handleChangeUuid} />
            </ToolField>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handlePaste}>
                  <ClipboardPaste />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Paste</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleCopy}>
                  <Copy />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy</p>
              </TooltipContent>
            </Tooltip>
          </ToolRow>
        </ToolCard>
        <ToolCard>
          <ToolHeader title="Base Conversion" />
          <ToolRow>
            <ToolField label="Base 58 (Short)">
              <Input disabled value={base58Translator.fromUUID(uuid)} />
            </ToolField>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleCopyBase58}>
                  <Copy />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy Base 58</p>
              </TooltipContent>
            </Tooltip>
          </ToolRow>
          <ToolRow>
            <ToolField label="Base 36 (uuid25)">
              <Input disabled value={base36Translator.fromUUID(uuid)} />
            </ToolField>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleCopyBase36}>
                  <Copy />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy Base 36</p>
              </TooltipContent>
            </Tooltip>
          </ToolRow>
          <ToolRow>
            <ToolField label="Base 90 (Cookies)">
              <Input disabled value={base90Translator.fromUUID(uuid)} />
            </ToolField>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleCopyBase90}>
                  <Copy />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy Base 90</p>
              </TooltipContent>
            </Tooltip>
          </ToolRow>
        </ToolCard>
      </div>
    </>
  );
}
