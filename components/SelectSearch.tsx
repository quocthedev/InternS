"use client";
import { Chip } from "@nextui-org/chip";
import { Input } from "@nextui-org/input";
import { Select, SelectItem } from "@nextui-org/select";
import { SharedSelection } from "@nextui-org/system";
import { cn } from "@nextui-org/theme";
import { useState } from "react";

export type SelectSearchItem = {
  key: string;
  value: string;
  label: string;
  chipLabel?: string;
};

export type SelectSearchProps = {
  items: Array<SelectSearchItem>;
  name?: string;
  label?: string;
  variant?: "bordered" | "underlined" | "flat" | "faded";
  chipColor?:
    | "default"
    | "primary"
    | "success"
    | "warning"
    | "secondary"
    | "danger";
  placeholder: string;
  selectionMode: "single" | "multiple";
  selectedItems?: Array<SelectSearchItem>;
  setSelectedItems?: (items: Array<SelectSearchItem>) => void;
  inputSearchPlaceholder?: string;
  onSearchChange: (search: string) => void;
  isLoading?: boolean;
  className?: string;
  scrollRef?: React.RefObject<HTMLElement>;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  required?: boolean;
};

export default function SelectSearch(props: SelectSearchProps) {
  const [isOpenSearch, setIsOpenSearch] = useState(false);

  const [selectedItems, setSelectedItems] = useState<Array<SelectSearchItem>>(
    [],
  );

  const selections = props.selectedItems || selectedItems;

  const setSelections = props.setSelectedItems || setSelectedItems;

  function handleSelectionChange(keys: SharedSelection) {
    const selectedKeys = Array.from(keys) as Array<string>;

    // Get unselected items
    const unselectedItems = props.items
      .filter((item) => !selectedKeys.includes(item.key))
      .map((item) => item.key);

    console.log("unselectedItems", unselectedItems);

    // remove unselected items from selectedItems
    const newSelections = selections.filter(
      (item) => !unselectedItems.includes(item.key),
    );

    console.log("newSelections", newSelections);

    // append selected items to selectedItemsData if not already in selectedItemsData
    selectedKeys.forEach((key) => {
      const previouslySelected = newSelections.find(
        (item: SelectSearchItem) => item.key === key,
      );

      if (!previouslySelected) {
        const item = Array.from(props.items).find(
          (item: SelectSearchItem) => item.key === key,
        );

        if (item !== undefined) newSelections.push(item);
      }
    });

    setSelections(newSelections);
  }

  const isOpen = props.isOpen || isOpenSearch;
  const setIsOpen = props.setIsOpen || setIsOpenSearch;

  // placeholder only shows when items is empty and selection is empty
  const placeholder = props.placeholder;

  return (
    <div className="relative">
      <Select
        name={props.name}
        label={props.label}
        labelPlacement="outside"
        variant={props.variant}
        selectionMode={props.selectionMode}
        onSelectionChange={handleSelectionChange}
        placeholder={placeholder}
        listboxProps={{
          topContent: (
            <Input
              placeholder={props.inputSearchPlaceholder}
              className="w-full"
              onChange={(e) => {
                props.onSearchChange(e.target.value);
              }}
              variant="underlined"
            />
          ),
        }}
        isLoading={props.isLoading}
        scrollRef={props.scrollRef}
        onOpenChange={(isOpen) => {
          setIsOpen(isOpen);

          props.onSearchChange("");
        }}
        isOpen={isOpen}
        renderValue={() => {
          return <></>;
        }}
        className={cn(props.className)}
        items={props.items}
        selectedKeys={selections.map((item) => item.key)}
        required={props.required}
      >
        {(item) => (
          <SelectItem key={item.key} value={item.value}>
            {item.label}
          </SelectItem>
        )}
      </Select>

      {selections.length !== 0 && (
        <div className="pointer-events-none absolute bottom-2 left-0 ml-2 flex items-center justify-center gap-1">
          {selections.map((item) => {
            return (
              <Chip
                key={item.key}
                color={props.chipColor || "primary"}
                size="sm"
                onClose={() => {
                  // remove item from selectedItems by its key using filter

                  const selectedItemsData = selections.filter(
                    (selectedItem) => selectedItem.key !== item.key,
                  );

                  setSelections(selectedItemsData);
                }}
                className="pointer-events-auto hover:cursor-pointer"
              >
                <p className="">{item.chipLabel || item.label}</p>
              </Chip>
            );
          })}
          <p className="pointer-events-none text-sm text-foreground-500">
            {props.placeholder}
          </p>
        </div>
      )}
    </div>
  );
}