/*
 * SonarQube
 * Copyright (C) 2009-2023 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import { useTheme as themeInfo } from '@emotion/react';
import classNames from 'classnames';
import { omit } from 'lodash';
import { ReactNode } from 'react';
import ReactSelect, {
  GroupBase,
  Props as NamedProps,
  OptionProps,
  StylesConfig,
  components,
} from 'react-select';
import { INPUT_SIZES } from '../helpers';
import { themeBorder, themeColor, themeContrast } from '../helpers/theme';
import { InputSizeKeys } from '../types/theme';
import { ChevronDownIcon } from './icons';

export interface LabelValueSelectOption<V = string> {
  Icon?: ReactNode;
  label: string;
  value: V;
}

interface StyleExtensionProps {
  size?: InputSizeKeys;
}

type SelectProps<
  Option = LabelValueSelectOption,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>
> = NamedProps<Option, IsMulti, Group> & StyleExtensionProps;

function IconOption<
  Option extends LabelValueSelectOption,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>
>(props: OptionProps<Option, IsMulti, Group>) {
  const {
    data: { label, Icon },
  } = props;

  return (
    <components.Option {...props}>
      <div className="sw-flex sw-items-center sw-gap-1">
        {Icon}
        {label}
      </div>
    </components.Option>
  );
}

function SingleValue<
  Option extends LabelValueSelectOption,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>
>(props: OptionProps<Option, IsMulti, Group>) {
  const {
    data: { label, Icon },
  } = props;

  return (
    <components.SingleValue {...props}>
      <div className="sw-flex sw-items-center sw-gap-1">
        {Icon}
        {label}
      </div>
    </components.SingleValue>
  );
}

function IndicatorsContainer<
  Option extends LabelValueSelectOption,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>
>(props: OptionProps<Option, IsMulti, Group>) {
  return (
    <components.IndicatorsContainer {...props}>
      <div className="sw-pr-2">
        <ChevronDownIcon />
      </div>
    </components.IndicatorsContainer>
  );
}

export function InputSelect<
  Option extends LabelValueSelectOption = LabelValueSelectOption,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>
>({ size = 'medium', ...props }: SelectProps<Option, IsMulti, Group>) {
  return (
    <ReactSelect<Option, IsMulti, Group>
      {...omit(props, 'className', 'large')}
      className={classNames('react-select', props.className)}
      classNamePrefix="react-select"
      classNames={{
        container: () => 'sw-relative sw-inline-block sw-align-middle',
        placeholder: () => 'sw-truncate sw-leading-4',
        menu: () => 'sw-overflow-y-auto sw-py-2 sw-max-h-[12.25rem]',
        control: ({ isDisabled }) =>
          classNames(
            'sw-absolut sw-box-border sw-rounded-2 sw-mt-1 sw-overflow-hidden sw-z-dropdown-menu',
            isDisabled && 'sw-pointer-events-none sw-cursor-not-allowed'
          ),
        option: ({ isDisabled }) =>
          classNames(
            'sw-py-2 sw-px-3 sw-cursor-pointer',
            isDisabled && 'sw-pointer-events-none sw-cursor-not-allowed'
          ),
      }}
      components={{
        ...props.components,
        Option: IconOption,
        SingleValue,
        IndicatorsContainer,
        IndicatorSeparator: null,
      }}
      isSearchable={props.isSearchable ?? false}
      styles={selectStyle<Option, IsMulti, Group>({ size })}
    />
  );
}

export function selectStyle<
  Option = LabelValueSelectOption,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>
>({ size }: { size: InputSizeKeys }): StylesConfig<Option, IsMulti, Group> {
  const theme = themeInfo();

  return {
    container: (base) => ({
      ...base,
      width: INPUT_SIZES[size],
    }),
    control: (base, { isFocused, menuIsOpen, isDisabled }) => ({
      ...base,
      color: themeContrast('inputBackground')({ theme }),
      background: themeColor('inputBackground')({ theme }),
      transition: 'border 0.2s ease, outline 0.2s ease',
      outline: isFocused && !menuIsOpen ? themeBorder('focus', 'inputFocus')({ theme }) : 'none',
      ...(isDisabled && {
        color: themeContrast('inputDisabled')({ theme }),
        background: themeColor('inputDisabled')({ theme }),
        border: themeBorder('default', 'inputDisabledBorder')({ theme }),
        outline: 'none',
      }),
      ...(isFocused && {
        border: themeBorder('default', 'inputBorder')({ theme }),
      }),
    }),
    menu: (base) => ({
      ...base,
      width: INPUT_SIZES[size],
      zIndex: 101,
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      ...((isSelected || isFocused) && {
        background: themeColor('selectOptionSelected')({ theme }),
        color: themeContrast('primaryLight')({ theme }),
      }),
    }),
    singleValue: (base) => ({
      ...base,
      color: themeContrast('primaryLight')({ theme }),
    }),
    placeholder: (base) => ({
      ...base,
      color: themeContrast('primaryLight')({ theme }),
    }),
  };
}