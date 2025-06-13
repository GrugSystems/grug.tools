import { ClipboardPaste, Copy } from 'lucide-react';
import { type ChangeEvent, useCallback, useEffect, useState } from 'react';
import short from 'short-uuid';
import { v1 as uuidV1, v4 as uuidV4, v6 as uuidV6, v7 as uuidV7 } from 'uuid';
import { Paste } from '~/components/shortcut';
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
import { useGlobalPaste } from '~/hooks/use-global-paste';
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

function isValidUUID(uuid: string): boolean {
  try {
    const trimmed = uuid.trim();
    return (
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
        trimmed,
      ) || /^[0-9a-fA-F]{32}$/.test(trimmed)
    );
  } catch {
    return false;
  }
}

function detectBase(input: string): string {
  const trimmed = input.trim();

  if (
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      trimmed,
    )
  ) {
    return 'hex';
  }

  if (/^[0-9a-fA-F]{32}$/.test(trimmed)) {
    return 'hex';
  }

  if (
    /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/.test(
      trimmed,
    ) &&
    trimmed.length < 32
  ) {
    return 'base58';
  }

  if (/^[0-9a-zA-Z]+$/.test(trimmed) && trimmed.length < 32) {
    return 'base36';
  }

  return 'hex';
}

function safeBaseConvert(
  uuid: string,
  converter: { fromUUID: (uuid: string) => string },
): string {
  try {
    if (!isValidUUID(uuid)) {
      return '';
    }
    return converter.fromUUID(uuid);
  } catch {
    return '';
  }
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
    const converted = safeBaseConvert(uuid, base58Translator);
    if (converted) {
      navigator.clipboard.writeText(converted);
    }
  }
  function handleCopyBase36() {
    const converted = safeBaseConvert(uuid, base36Translator);
    if (converted) {
      navigator.clipboard.writeText(converted);
    }
  }
  function handleCopyBase90() {
    const converted = safeBaseConvert(uuid, base90Translator);
    if (converted) {
      navigator.clipboard.writeText(converted);
    }
  }

  const handlePaste = useCallback((text: string) => {
    try {
      const detectedBase = detectBase(text);

      if (detectedBase === 'hex') {
        setUuid(text);
      } else if (detectedBase === 'base58') {
        setUuid(base58Translator.toUUID(text));
      } else if (detectedBase === 'base36') {
        setUuid(base36Translator.toUUID(text));
      }
    } catch (err) {
      console.error('Failed to convert UUID: ', err);
      alert('Failed to convert the pasted text to UUID format.');
    }
  }, []);

  async function handleManualPaste() {
    try {
      const text = await navigator.clipboard.readText();
      handlePaste(text);
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      alert(
        'Failed to read from clipboard. Please try again or paste manually.',
      );
    }
  }

  useGlobalPaste(handlePaste);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        event.preventDefault();
        handleManualPaste();
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
          {description}. Paste an existing UUID in any supported format with{' '}
          <Paste />.
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
                <Button onClick={handleManualPaste}>
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
              <Input disabled value={safeBaseConvert(uuid, base58Translator)} />
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
              <Input disabled value={safeBaseConvert(uuid, base36Translator)} />
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
              <Input disabled value={safeBaseConvert(uuid, base90Translator)} />
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
