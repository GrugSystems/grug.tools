import { converter, formatCss, formatHex, formatHsl, parse } from 'culori';
import { ClipboardPaste, Copy, Pipette } from 'lucide-react';
import { type ChangeEvent, useEffect, useState } from 'react';
import { Shortcut } from '~/components/shortcut';
import { ToolCard, ToolField, ToolHeader, ToolRow } from '~/components/tool';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import type { Route } from './+types/colors';

const description =
  'Convert colors between RGB, HSL, OKLab, and OKLCH color spaces';

export function meta(_: Route.MetaArgs) {
  return [
    { title: 'Color Space Converter | Grug Tools' },
    { name: 'description', content: description },
  ];
}

const rgb = converter('rgb');
const hsl = converter('hsl');
const oklab = converter('oklab');
const oklch = converter('oklch');

export default function Colors() {
  const [color, setColor] = useState('#3b82f6');

  const rgbColor = rgb(color);
  const hslColor = hsl(color);
  const oklabColor = oklab(color);
  const oklchColor = oklch(color);

  function handleChangeColor(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setColor(value);
  }

  function handleColorPickerChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setColor(value);
  }

  function handleCopyHex() {
    if (rgbColor) {
      navigator.clipboard.writeText(formatHex(rgbColor));
    }
  }

  function handleCopyRgb() {
    if (rgbColor) {
      navigator.clipboard.writeText(
        `rgb(${Math.round(rgbColor.r * 255)}, ${Math.round(rgbColor.g * 255)}, ${Math.round(rgbColor.b * 255)})`,
      );
    }
  }

  function handleCopyHsl() {
    if (hslColor) {
      navigator.clipboard.writeText(formatHsl(hslColor));
    }
  }

  function handleCopyOklab() {
    if (oklabColor) {
      navigator.clipboard.writeText(formatCss(oklabColor));
    }
  }

  function handleCopyOklch() {
    if (oklchColor) {
      navigator.clipboard.writeText(formatCss(oklchColor));
    }
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      const parsedColor = parse(text);

      if (parsedColor) {
        setColor(text);
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
  }, [handlePaste]);

  return (
    <>
      <ToolHeader title="Color Space Converter">
        <p>
          {description}. Paste any color format with{' '}
          <Shortcut keys={['mod', 'v']} />.
        </p>
      </ToolHeader>
      <div className="flex flex-col gap-4">
        <ToolCard>
          <ToolHeader title="Color Input">
            Enter a color in any supported format
          </ToolHeader>
          <ToolRow>
            <ToolField label="Color">
              <Input
                value={color}
                onChange={handleChangeColor}
                placeholder="#3b82f6 or rgb(59, 130, 246)"
              />
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
          </ToolRow>
          {rgbColor && (
            <div className="mt-4">
              <div className="relative group">
                <div
                  className="w-full h-16 rounded-md border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors flex items-center justify-center"
                  style={{ backgroundColor: formatHex(rgbColor) }}
                  onClick={() =>
                    document.getElementById('colorPicker')?.click()
                  }
                >
                  <Pipette
                    className="w-6 h-6 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
                    style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))' }}
                  />
                </div>
                <input
                  id="colorPicker"
                  type="color"
                  value={formatHex(rgbColor)}
                  onChange={handleColorPickerChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          )}
        </ToolCard>

        {rgbColor && (
          <ToolCard>
            <ToolHeader title="Color Space Conversions" />
            <ToolRow>
              <ToolField label="Hex">
                <Input disabled value={formatHex(rgbColor)} />
              </ToolField>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleCopyHex}>
                    <Copy />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy Hex</p>
                </TooltipContent>
              </Tooltip>
            </ToolRow>
            <ToolRow>
              <ToolField label="RGB">
                <Input
                  disabled
                  value={`rgb(${Math.round(rgbColor.r * 255)}, ${Math.round(rgbColor.g * 255)}, ${Math.round(rgbColor.b * 255)})`}
                />
              </ToolField>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleCopyRgb}>
                    <Copy />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy RGB</p>
                </TooltipContent>
              </Tooltip>
            </ToolRow>
            {hslColor && (
              <ToolRow>
                <ToolField label="HSL">
                  <Input disabled value={formatHsl(hslColor)} />
                </ToolField>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={handleCopyHsl}>
                      <Copy />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy HSL</p>
                  </TooltipContent>
                </Tooltip>
              </ToolRow>
            )}
            {oklabColor && (
              <ToolRow>
                <ToolField label="OKLAB">
                  <Input disabled value={formatCss(oklabColor)} />
                </ToolField>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={handleCopyOklab}>
                      <Copy />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy OKLAB</p>
                  </TooltipContent>
                </Tooltip>
              </ToolRow>
            )}
            {oklchColor && (
              <ToolRow>
                <ToolField label="OKLCH">
                  <Input disabled value={formatCss(oklchColor)} />
                </ToolField>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={handleCopyOklch}>
                      <Copy />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy OKLCH</p>
                  </TooltipContent>
                </Tooltip>
              </ToolRow>
            )}
          </ToolCard>
        )}
      </div>
    </>
  );
}
