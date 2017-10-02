/**
 * @Author: guiguan
 * @Date:   2017-09-21T15:25:12+10:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-09-22T16:01:13+10:00
 *
 * dbKoda - a modern, open source code editor, for MongoDB.
 * Copyright (C) 2017-2018 Southbank Software
 *
 * This file is part of dbKoda.
 *
 * dbKoda is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * dbKoda is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with dbKoda.  If not, see <http://www.gnu.org/licenses/>.
 */

declare module '@blueprintjs/core' {
  declare export class ITreeNode {
    /**
     * Child tree nodes of this node.
     */
    childNodes?: ITreeNode[],

    /**
     * A space-delimited string of class names to apply to the node.
     */
    className?: string,

    /**
     * Whether the caret to expand/collapse a node should be shown.
     * If not specified, this will be true if the node has children and false otherwise.
     */
    hasCaret?: boolean,

    /**
     * The name of a Blueprint icon to display next to the node's label.
     */
    iconName?: string,

    /**
     * A unique identifier for the node.
     */
    id: string | number,

    /**
     * Whether the children of this node are displayed.
     * @default false
     */
    isExpanded?: boolean,

    /**
     * Whether this node is selected.
     * @default false
     */
    isSelected?: boolean,

    /**
     * The main label for the node.
     */
    label: string | React.Element,

    /**
     * A secondary label/component that is displayed at the right side of the node.
     */
    secondaryLabel?: string | React.Element,
  }

  declare export class ContextMenu {
    static show(menu: React.Element, offset: {left: number, top: number}): void;
  }

  declare export var Tree;
  declare export var Menu;
  declare export var MenuItem;
  declare export var Checkbox;

  declare export default any;
}

/**
 * We include stubs for each file inside this npm package in case you need to
 * require those files directly. Feel free to delete any files that aren't
 * needed.
 */
declare module '@blueprintjs/core/dist/accessibility/focusStyleManager' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/accessibility/index' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/common/abstractComponent' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/common/classes' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/common/colors' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/common/errors' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/common/index' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/common/intent' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/common/interactionMode' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/common/keys' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/common/position' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/common/props' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/common/tetherUtils' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/common/utils' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/compatibility/browser' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/compatibility/index' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/alert/alert' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/breadcrumbs/breadcrumb' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/button/abstractButton' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/button/buttons' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/collapse/collapse' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/collapsible-list/collapsibleList' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/context-menu/contextMenu' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/context-menu/contextMenuTarget' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/dialog/dialog' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/editable-text/editableText' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/forms/controls' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/forms/inputGroup' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/forms/numericInput' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/forms/radioGroup' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/hotkeys/hotkey' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/hotkeys/hotkeyParser' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/hotkeys/hotkeys' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/hotkeys/hotkeysDialog' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/hotkeys/hotkeysEvents' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/hotkeys/hotkeysTarget' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/hotkeys/keyCombo' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/index' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/menu/menu' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/menu/menuDivider' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/menu/menuItem' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/non-ideal-state/nonIdealState' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/overlay/overlay' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/popover/arrows' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/popover/popover' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/popover/svgPopover' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/portal/portal' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/progress/progressBar' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/slider/coreSlider' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/slider/handle' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/slider/rangeSlider' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/slider/slider' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/spinner/spinner' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/spinner/svgSpinner' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/tabs/tab' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/tabs/tabList' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/tabs/tabPanel' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/tabs/tabs' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/tabs2/tab2' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/tabs2/tabs2' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/tabs2/tabTitle' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/tag/tag' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/text/text' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/toast/toast' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/toast/toaster' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/tooltip/svgTooltip' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/tooltip/tooltip' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/tree/tree' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/components/tree/treeNode' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/core.bundle' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/generated/iconClasses' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/generated/iconStrings' {
  declare module.exports: any;
}

declare module '@blueprintjs/core/dist/index' {
  declare module.exports: any;
}

// Filename aliases
declare module '@blueprintjs/core/dist/accessibility/focusStyleManager.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/accessibility/focusStyleManager'>;
}
declare module '@blueprintjs/core/dist/accessibility/index.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/accessibility/index'>;
}
declare module '@blueprintjs/core/dist/common/abstractComponent.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/common/abstractComponent'>;
}
declare module '@blueprintjs/core/dist/common/classes.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/common/classes'>;
}
declare module '@blueprintjs/core/dist/common/colors.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/common/colors'>;
}
declare module '@blueprintjs/core/dist/common/errors.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/common/errors'>;
}
declare module '@blueprintjs/core/dist/common/index.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/common/index'>;
}
declare module '@blueprintjs/core/dist/common/intent.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/common/intent'>;
}
declare module '@blueprintjs/core/dist/common/interactionMode.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/common/interactionMode'>;
}
declare module '@blueprintjs/core/dist/common/keys.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/common/keys'>;
}
declare module '@blueprintjs/core/dist/common/position.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/common/position'>;
}
declare module '@blueprintjs/core/dist/common/props.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/common/props'>;
}
declare module '@blueprintjs/core/dist/common/tetherUtils.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/common/tetherUtils'>;
}
declare module '@blueprintjs/core/dist/common/utils.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/common/utils'>;
}
declare module '@blueprintjs/core/dist/compatibility/browser.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/compatibility/browser'>;
}
declare module '@blueprintjs/core/dist/compatibility/index.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/compatibility/index'>;
}
declare module '@blueprintjs/core/dist/components/alert/alert.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/alert/alert'>;
}
declare module '@blueprintjs/core/dist/components/breadcrumbs/breadcrumb.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/breadcrumbs/breadcrumb'>;
}
declare module '@blueprintjs/core/dist/components/button/abstractButton.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/button/abstractButton'>;
}
declare module '@blueprintjs/core/dist/components/button/buttons.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/button/buttons'>;
}
declare module '@blueprintjs/core/dist/components/collapse/collapse.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/collapse/collapse'>;
}
declare module '@blueprintjs/core/dist/components/collapsible-list/collapsibleList.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/collapsible-list/collapsibleList'>;
}
declare module '@blueprintjs/core/dist/components/context-menu/contextMenu.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/context-menu/contextMenu'>;
}
declare module '@blueprintjs/core/dist/components/context-menu/contextMenuTarget.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/context-menu/contextMenuTarget'>;
}
declare module '@blueprintjs/core/dist/components/dialog/dialog.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/dialog/dialog'>;
}
declare module '@blueprintjs/core/dist/components/editable-text/editableText.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/editable-text/editableText'>;
}
declare module '@blueprintjs/core/dist/components/forms/controls.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/forms/controls'>;
}
declare module '@blueprintjs/core/dist/components/forms/inputGroup.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/forms/inputGroup'>;
}
declare module '@blueprintjs/core/dist/components/forms/numericInput.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/forms/numericInput'>;
}
declare module '@blueprintjs/core/dist/components/forms/radioGroup.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/forms/radioGroup'>;
}
declare module '@blueprintjs/core/dist/components/hotkeys/hotkey.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/hotkeys/hotkey'>;
}
declare module '@blueprintjs/core/dist/components/hotkeys/hotkeyParser.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/hotkeys/hotkeyParser'>;
}
declare module '@blueprintjs/core/dist/components/hotkeys/hotkeys.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/hotkeys/hotkeys'>;
}
declare module '@blueprintjs/core/dist/components/hotkeys/hotkeysDialog.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/hotkeys/hotkeysDialog'>;
}
declare module '@blueprintjs/core/dist/components/hotkeys/hotkeysEvents.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/hotkeys/hotkeysEvents'>;
}
declare module '@blueprintjs/core/dist/components/hotkeys/hotkeysTarget.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/hotkeys/hotkeysTarget'>;
}
declare module '@blueprintjs/core/dist/components/hotkeys/keyCombo.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/hotkeys/keyCombo'>;
}
declare module '@blueprintjs/core/dist/components/index.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/index'>;
}
declare module '@blueprintjs/core/dist/components/menu/menu.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/menu/menu'>;
}
declare module '@blueprintjs/core/dist/components/menu/menuDivider.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/menu/menuDivider'>;
}
declare module '@blueprintjs/core/dist/components/menu/menuItem.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/menu/menuItem'>;
}
declare module '@blueprintjs/core/dist/components/non-ideal-state/nonIdealState.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/non-ideal-state/nonIdealState'>;
}
declare module '@blueprintjs/core/dist/components/overlay/overlay.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/overlay/overlay'>;
}
declare module '@blueprintjs/core/dist/components/popover/arrows.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/popover/arrows'>;
}
declare module '@blueprintjs/core/dist/components/popover/popover.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/popover/popover'>;
}
declare module '@blueprintjs/core/dist/components/popover/svgPopover.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/popover/svgPopover'>;
}
declare module '@blueprintjs/core/dist/components/portal/portal.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/portal/portal'>;
}
declare module '@blueprintjs/core/dist/components/progress/progressBar.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/progress/progressBar'>;
}
declare module '@blueprintjs/core/dist/components/slider/coreSlider.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/slider/coreSlider'>;
}
declare module '@blueprintjs/core/dist/components/slider/handle.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/slider/handle'>;
}
declare module '@blueprintjs/core/dist/components/slider/rangeSlider.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/slider/rangeSlider'>;
}
declare module '@blueprintjs/core/dist/components/slider/slider.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/slider/slider'>;
}
declare module '@blueprintjs/core/dist/components/spinner/spinner.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/spinner/spinner'>;
}
declare module '@blueprintjs/core/dist/components/spinner/svgSpinner.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/spinner/svgSpinner'>;
}
declare module '@blueprintjs/core/dist/components/tabs/tab.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/tabs/tab'>;
}
declare module '@blueprintjs/core/dist/components/tabs/tabList.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/tabs/tabList'>;
}
declare module '@blueprintjs/core/dist/components/tabs/tabPanel.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/tabs/tabPanel'>;
}
declare module '@blueprintjs/core/dist/components/tabs/tabs.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/tabs/tabs'>;
}
declare module '@blueprintjs/core/dist/components/tabs2/tab2.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/tabs2/tab2'>;
}
declare module '@blueprintjs/core/dist/components/tabs2/tabs2.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/tabs2/tabs2'>;
}
declare module '@blueprintjs/core/dist/components/tabs2/tabTitle.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/tabs2/tabTitle'>;
}
declare module '@blueprintjs/core/dist/components/tag/tag.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/tag/tag'>;
}
declare module '@blueprintjs/core/dist/components/text/text.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/text/text'>;
}
declare module '@blueprintjs/core/dist/components/toast/toast.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/toast/toast'>;
}
declare module '@blueprintjs/core/dist/components/toast/toaster.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/toast/toaster'>;
}
declare module '@blueprintjs/core/dist/components/tooltip/svgTooltip.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/tooltip/svgTooltip'>;
}
declare module '@blueprintjs/core/dist/components/tooltip/tooltip.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/tooltip/tooltip'>;
}
declare module '@blueprintjs/core/dist/components/tree/tree.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/tree/tree'>;
}
declare module '@blueprintjs/core/dist/components/tree/treeNode.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/components/tree/treeNode'>;
}
declare module '@blueprintjs/core/dist/core.bundle.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/core.bundle'>;
}
declare module '@blueprintjs/core/dist/generated/iconClasses.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/generated/iconClasses'>;
}
declare module '@blueprintjs/core/dist/generated/iconStrings.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/generated/iconStrings'>;
}
declare module '@blueprintjs/core/dist/index.js' {
  declare module.exports: $Exports<'@blueprintjs/core/dist/index'>;
}