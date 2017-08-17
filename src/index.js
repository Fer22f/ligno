/* @flow */
import type Vue from 'vue'

import TextButton from './TextButton'
import Checkbox from './Checkbox'

import TextBox from './TextBox'
import MaskTextBox from './MaskTextBox'
import AutoComplete from './AutoComplete'
import BoletoTextBox from './BoletoTextBox'

import Picker from './Picker'
import Dropdown from './Dropdown'
import CheckDropdown from './CheckDropdown'

import DataTable from './DataTable'
import TreeDataTable from './TreeDataTable'
import TableTextBox from './TableTextBox'
import TableExtraItems from './TableExtraItems'
import DynamicList from './DynamicList'

import OverlayDialog from './OverlayDialog'
import Tooltip from './Tooltip'

import './directives/waves'

export default {
  install (Vue: Vue) {
    Object.entries({
      Picker,
      DataTable,
      TextButton,
      OverlayDialog,
      TextBox,
      Checkbox,
      Dropdown,
      CheckDropdown,
      TableTextBox,
      TreeDataTable,
      TableExtraItems,
      MaskTextBox,
      DynamicList,
      AutoComplete,
      BoletoTextBox,
      Tooltip
    }).forEach(([key, value]) => {
      Vue.component(key, value)
    })
  }
}
