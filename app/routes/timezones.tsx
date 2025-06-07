import { ArrowLeftRight, Copy } from 'lucide-react';
import { DateTime } from 'luxon';
import { type ChangeEvent, useMemo, useState } from 'react';
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

const description = 'Enter a time and convert it between timezones';

export function meta(_: Route.MetaArgs) {
  return [
    { title: 'Timezone Converter | Grug Tools' },
    { name: 'description', content: description },
  ];
}

const zones = Intl.supportedValuesOf('timeZone');
const htmlFormat = 'HH:mm';

export default function Lipsum() {
  const loadedTime = useMemo(
    () => DateTime.now().startOf('minute').toFormat(htmlFormat),
    [],
  );
  const [time, setTime] = useState(loadedTime);
  const [fromZone, setFromZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
  const [toZone, setToZone] = useState('UTC');

  const converted = useMemo(
    () =>
      DateTime.fromFormat(time, htmlFormat, { zone: fromZone })
        .startOf('minute')
        .setZone(toZone)
        .toFormat(htmlFormat),
    [time, fromZone, toZone],
  );

  function handleChangeTime(e: ChangeEvent<HTMLInputElement>) {
    setTime(e.target.value);
  }

  function handleSwapTimezones() {
    setFromZone(toZone);
    setToZone(fromZone);
  }

  function handleCopy() {}

  return (
    <>
      <ToolHeader title="Timezone Converter">
        <p>{description}</p>
      </ToolHeader>
      <ToolCard>
        <ToolRow>
          <ToolField label="Time">
            <Input type="time" value={time} onChange={handleChangeTime} />
          </ToolField>
        </ToolRow>
        <ToolRow>
          <ToolField label="From Timezone" className="flex-1">
            <Select value={fromZone} onValueChange={setFromZone}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="From Timezone" />
              </SelectTrigger>
              <SelectContent>
                {zones.map((zone) => (
                  <SelectItem key={zone} value={zone}>
                    {zone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </ToolField>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleSwapTimezones}>
                <ArrowLeftRight />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Swap Timezones</p>
            </TooltipContent>
          </Tooltip>
          <ToolField label="To Timezone" className="flex-1">
            <Select value={toZone} onValueChange={setToZone}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="To Timezone" />
              </SelectTrigger>
              <SelectContent>
                {zones.map((zone) => (
                  <SelectItem key={zone} value={zone}>
                    {zone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </ToolField>
        </ToolRow>
        <ToolRow>
          <ToolField label="Converted Time">
            <Input type="time" disabled value={converted} />
          </ToolField>
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
    </>
  );
}
