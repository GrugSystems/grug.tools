import yaml from 'js-yaml';
import { ArrowLeftRight, Copy } from 'lucide-react';
import Papa from 'papaparse';
import { type ChangeEvent, useState } from 'react';
import * as TOML from 'smol-toml';
import { ToolCard, ToolField, ToolHeader, ToolRow } from '~/components/tool';
import { Button } from '~/components/ui/button';
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

const description = 'Convert between JSON, YAML, TOML, and CSV formats';

export function meta(_: Route.MetaArgs) {
  return [
    { title: 'Format Converter | Grug Tools' },
    { name: 'description', content: description },
  ];
}

const formats = [
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'toml', label: 'TOML' },
  { value: 'csv', label: 'CSV' },
];

function parseInput(input: string, format: string): unknown {
  if (!input.trim()) return null;

  try {
    switch (format) {
      case 'json':
        return JSON.parse(input);
      case 'yaml':
        return yaml.load(input);
      case 'toml':
        return TOML.parse(input);
      case 'csv': {
        const result = Papa.parse(input, {
          header: true,
          skipEmptyLines: true,
        });
        if (result.errors.length > 0) {
          throw new Error(result.errors.map((e) => e.message).join(', '));
        }
        return result.data;
      }
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  } catch (error) {
    throw new Error(
      `Failed to parse ${format.toUpperCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

function formatOutput(data: unknown, format: string): string {
  if (data === null || data === undefined) return '';

  try {
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'yaml':
        return yaml.dump(data, { indent: 2, lineWidth: -1 });
      case 'toml':
        return TOML.stringify(data);
      case 'csv':
        if (Array.isArray(data)) {
          return Papa.unparse(data);
        } else if (data !== null && typeof data === 'object') {
          // Convert single object to array for CSV
          return Papa.unparse([data]);
        } else {
          throw new Error('CSV format requires array or object data');
        }
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  } catch (error) {
    throw new Error(
      `Failed to format as ${format.toUpperCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

export default function Converter() {
  const [inputFormat, setInputFormat] = useState('json');
  const [outputFormat, setOutputFormat] = useState('yaml');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [error, setError] = useState('');

  function handleInputChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    setInputText(value);
    convertData(value, inputFormat, outputFormat);
  }

  function handleInputFormatChange(format: string) {
    setInputFormat(format);
    convertData(inputText, format, outputFormat);
  }

  function handleOutputFormatChange(format: string) {
    setOutputFormat(format);
    convertData(inputText, inputFormat, format);
  }

  function convertData(input: string, fromFormat: string, toFormat: string) {
    setError('');

    if (!input.trim()) {
      setOutputText('');
      return;
    }

    try {
      const parsed = parseInput(input, fromFormat);
      const formatted = formatOutput(parsed, toFormat);
      setOutputText(formatted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
      setOutputText('');
    }
  }

  function handleSwapFormats() {
    const newInputFormat = outputFormat;
    const newOutputFormat = inputFormat;

    setInputFormat(newInputFormat);
    setOutputFormat(newOutputFormat);
    setInputText(outputText);

    convertData(outputText, newInputFormat, newOutputFormat);
  }

  function handleCopyOutput() {
    navigator.clipboard.writeText(outputText);
  }

  function handleClearInput() {
    setInputText('');
    setOutputText('');
    setError('');
  }

  return (
    <>
      <ToolHeader title="Format Converter">
        <p>{description}</p>
      </ToolHeader>
      <div className="flex flex-col gap-4">
        <ToolCard>
          <ToolHeader title="Format Selection">
            Choose input and output formats for conversion
          </ToolHeader>
          <ToolRow>
            <ToolField label="Input Format">
              <Select
                value={inputFormat}
                onValueChange={handleInputFormatChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ToolField>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleSwapFormats}>
                  <ArrowLeftRight />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Swap formats</p>
              </TooltipContent>
            </Tooltip>

            <ToolField label="Output Format">
              <Select
                value={outputFormat}
                onValueChange={handleOutputFormatChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ToolField>
          </ToolRow>
        </ToolCard>

        <ToolCard>
          <ToolHeader title="Input">
            Enter your {inputFormat.toUpperCase()} data here
          </ToolHeader>
          <ToolRow>
            <ToolField label="Data">
              <textarea
                value={inputText}
                onChange={handleInputChange}
                placeholder={`Enter ${inputFormat.toUpperCase()} data here...`}
                className="w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-sm resize-vertical"
              />
            </ToolField>
          </ToolRow>
          <ToolRow>
            <Button onClick={handleClearInput} variant="outline">
              Clear
            </Button>
          </ToolRow>
          {error && (
            <ToolRow>
              <div className="w-full p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </ToolRow>
          )}
        </ToolCard>

        <ToolCard>
          <ToolHeader title="Output">
            Converted {outputFormat.toUpperCase()} data
          </ToolHeader>
          <ToolRow>
            <ToolField label="Result">
              <div className="relative">
                <textarea
                  value={outputText}
                  readOnly
                  placeholder={`${outputFormat.toUpperCase()} output will appear here...`}
                  className="w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-sm bg-gray-50 resize-vertical"
                />
                {outputText && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleCopyOutput}
                        className="absolute top-2 right-2"
                        size="sm"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy output</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </ToolField>
          </ToolRow>
        </ToolCard>
      </div>
    </>
  );
}
