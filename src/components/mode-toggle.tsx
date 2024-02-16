// import { Moon, Sun } from 'lucide-react';
//== Icons ==//
import { MoonIcon, SunIcon } from '../@/components/ui/icons/icons';

import { Button } from '../@/components/ui/tailwind/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../@/components/ui/shadcn/dropdown-menu';
import { useTheme } from './theme-provider';

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button plain>
          {' '}
          <SunIcon className='h-6 w-6 fill-zinc-100 stroke-zinc-500 transition group-hover:fill-zinc-200 group-hover:stroke-zinc-700 dark:hidden [@media(prefers-color-scheme:dark)]:fill-gray-50 [@media(prefers-color-scheme:dark)]:stroke-gray-500 [@media(prefers-color-scheme:dark)]:group-hover:fill-gray-50 [@media(prefers-color-scheme:dark)]:group-hover:stroke-gray-600' />
          <MoonIcon className='hidden h-6 w-6 fill-gray-100 stroke-gray-200 transition dark:block [@media(prefers-color-scheme:dark)]:group-hover:stroke-zinc-400 [@media_not_(prefers-color-scheme:dark)]:fill-teal-400/10 [@media_not_(prefers-color-scheme:dark)]:stroke-teal-500' />
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className='bg-gray-200 border rounded-sm'
      >
        <DropdownMenuItem onClick={() => setTheme('light')}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
