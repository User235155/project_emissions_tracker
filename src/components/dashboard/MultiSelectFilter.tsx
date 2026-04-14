import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function MultiSelectFilter({
  label,
  options,
  selected,
  onChange,
  placeholder,
}: {
  label: string
  options: string[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder: string
}) {
  const toggleValue = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const clearAll = () => onChange([])

  const buttonText =
    selected.length === 0
      ? placeholder
      : selected.length <= 2
        ? selected.join(', ')
        : `${selected.length} selected`

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full justify-between bg-background font-normal"
          >
            <span className="truncate">{buttonText}</span>
            <span className="ml-2 text-xs text-muted-foreground">▼</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-64">
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option}
              checked={selected.includes(option)}
              onSelect={(e) => e.preventDefault()}
              onCheckedChange={() => toggleValue(option)}
            >
              {option}
            </DropdownMenuCheckboxItem>
          ))}

          <DropdownMenuSeparator />

          <button
            type="button"
            onClick={clearAll}
            className="w-full px-2 py-2 text-left text-sm text-muted-foreground hover:bg-muted"
          >
            Clear all
          </button>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}