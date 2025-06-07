import { LoremIpsum } from 'lorem-ipsum';
import { Copy } from 'lucide-react';
import { type ChangeEvent, useState } from 'react';
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
import type { Route } from './+types/home';

const description = 'Generate placeholder text for your designs and layouts';

export function meta(_: Route.MetaArgs) {
  return [
    { title: 'Lorem Ipsum | Grug Tools' },
    { name: 'description', content: description },
  ];
}

const generator = new LoremIpsum();

export default function Lipsum() {
  const [unit, setUnit] = useState('words');
  const [count, setCount] = useState(10);
  const [text, setText] = useState('');

  function handleChangeCount(e: ChangeEvent<HTMLInputElement>) {
    setCount(Number.parseInt(e.target.value, 10));
  }

  function handleGenerate() {
    if (unit === 'words') {
      setText(generator.generateWords(count));
    } else if (unit === 'sentences') {
      setText(generator.generateSentences(count));
    } else {
      setText(generator.generateParagraphs(count));
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(text);
  }

  return (
    <>
      <ToolHeader title="Lorem Ipsum Generator">
        <p>{description}</p>
      </ToolHeader>
      <ToolCard>
        <ToolHeader title="Generate Text">
          <p>Choose the unit and amount of lorem ipsum text</p>
        </ToolHeader>
        <ToolRow>
          <ToolField label="Type" className="flex-1">
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="words">Words</SelectItem>
                <SelectItem value="sentences">Sentences</SelectItem>
                <SelectItem value="paragraphs">Paragraphs</SelectItem>
              </SelectContent>
            </Select>
          </ToolField>
          <ToolField label="Count" className="flex-1">
            <Input
              type="number"
              value={count}
              min={1}
              onChange={handleChangeCount}
            />
          </ToolField>
        </ToolRow>
        <ToolRow>
          <Button className="w-full" onClick={handleGenerate}>
            Generate Lorem Ipsum
          </Button>
        </ToolRow>
      </ToolCard>
      {text ? (
        <ToolCard>
          <ToolHeader
            title="Generated Text"
            ActionIcon={Copy}
            actionLabel="Copy"
            onAction={handleCopy}
          />
          {text.split(/\n+/g).map((t) => (
            <p key={t}>{t}</p>
          ))}
        </ToolCard>
      ) : null}
    </>
  );
}
