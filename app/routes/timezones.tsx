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

const description = 'Enter a date and time and convert it between timezones';

export function meta(_: Route.MetaArgs) {
  return [
    { title: 'Timezone Converter | Grug Tools' },
    { name: 'description', content: description },
  ];
}

const zones = Intl.supportedValuesOf('timeZone');
const htmlTimeFormat = 'HH:mm';
const htmlDateFormat = 'yyyy-MM-dd';
const htmlDateTimeFormat = 'yyyy-MM-dd HH:mm';

export default function Lipsum() {
  const loadedDate = useMemo(() => DateTime.now().toFormat(htmlDateFormat), []);
  const loadedTime = useMemo(
    () => DateTime.now().startOf('minute').toFormat(htmlTimeFormat),
    [],
  );
  const [date, setDate] = useState(loadedDate);
  const [time, setTime] = useState(loadedTime);
  const [fromZone, setFromZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
  const [toZone, setToZone] = useState('UTC');

  const converted = useMemo(() => {
    const dateTime = DateTime.fromFormat(
      `${date} ${time}`,
      htmlDateTimeFormat,
      { zone: fromZone },
    );
    if (!dateTime.isValid) {
      return { date: '', time: '' };
    }
    const convertedDateTime = dateTime.startOf('minute').setZone(toZone);
    return {
      date: convertedDateTime.toFormat(htmlDateFormat),
      time: convertedDateTime.toFormat(htmlTimeFormat),
    };
  }, [date, time, fromZone, toZone]);

  function handleChangeDate(e: ChangeEvent<HTMLInputElement>) {
    setDate(e.target.value);
  }

  function handleChangeTime(e: ChangeEvent<HTMLInputElement>) {
    setTime(e.target.value);
  }

  function handleSwapTimezones() {
    setFromZone(toZone);
    setToZone(fromZone);
  }

  function handleCopy() {
    const copyText = `${converted.date} ${converted.time}`;
    navigator.clipboard.writeText(copyText);
  }

  return (
    <>
      <ToolHeader title="Timezone Converter">
        <p>{description}</p>
      </ToolHeader>
      <ToolCard>
        <ToolRow>
          <ToolField label="Date" className="flex-1">
            <Input type="date" value={date} onChange={handleChangeDate} />
          </ToolField>
          <ToolField label="Time" className="flex-1">
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
          <ToolField label="Converted Date">
            <Input type="date" disabled value={converted.date} />
          </ToolField>
          <ToolField label="Converted Time">
            <Input type="time" disabled value={converted.time} />
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
