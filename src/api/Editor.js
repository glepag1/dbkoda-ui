/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-07-28T08:56:08+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-08-29T13:35:29+10:00
 */

 import { action, observable } from 'mobx';
 import uuidV1 from 'uuid';
 import { Intent } from '@blueprintjs/core';
 import { featherClient } from '~/helpers/feathers';
 import { NewToaster } from '#/common/Toaster';
 import EventLogging from '#/common/logging/EventLogging';
 import { ProfileStatus } from '#/common/Constants';
 import { EditorTypes, DrawerPanes } from '#/common/Constants';

 import StaticApi from './static';

export default class EditorApi {
  store;
  api;
  constructor(store, api) {
    this.store = store;
    this.api = api;
  }
  /**
   * Method for adding a new editor to an existing connection.
   *
   * @param {Object} options - options for creating new editor
   * @return {Promise}
   */
  @action.bound
  addEditor(options = {}) {
    try {
      let editorOptions = {};
      if (options.constructor.name == 'Object') {
        editorOptions = options;
      }
      this.store.startCreatingNewEditor();
      const profileTitle = this.store.editorToolbar.newEditorForTreeAction
        ? this.store.profileList.selectedProfile.id
        : this.store.editorPanel.activeDropdownId;
      let profileId = 'UNKNOWN';
      this.store.profiles.forEach((value) => {
        if (value.id == profileTitle) {
          profileId = value.id;
        }
      });
      if (!editorOptions.type) {
        editorOptions.type = 'shell';
      }
      if (profileId == 'UNKNOWN') {
        if (this.store.userPreferences.telemetryEnabled) {
          EventLogging.recordManualEvent(
            EventLogging.getTypeEnum().EVENT.EDITOR_PANEL.NEW_EDITOR
              .FAILED_DEFAULT,
            EventLogging.getFragmentEnum().EDITORS,
            'Cannot create new Editor for Default Tab.',
          );
        }
        NewToaster.show({
          message: globalString('editor/toolbar/addEditorError'),
          intent: Intent.WARNING,
          iconName: 'pt-icon-thumbs-down',
        });
        this.createNewEditorFailed();
        return null;
      }
      return featherClient()
        .service('/mongo-shells')
        .create({ id: profileId })
        .then((res) => {
          return this.setNewEditorState(res, editorOptions);
        })
        .catch((err) => {
          if (this.store.userPreferences.telemetryEnabled) {
            EventLogging.recordManualEvent(
              EventLogging.getTypeEnum().ERROR,
              EventLogging.getFragmentEnum().EDITORS,
              err.message,
            );
          }
          this.createNewEditorFailed();
          // Object Object issue
          console.log(err);
          if (err.message == '[object Object]') {
            console.log('Error retrieved from Primus');
          } else {
            NewToaster.show({
              message: 'Error: ' + err.message,
              intent: Intent.DANGER,
              iconName: 'pt-icon-thumbs-down',
            });
          }
        });
    } catch (err) {
      if (this.store.userPreferences.telemetryEnabled) {
        EventLogging.recordManualEvent(
          EventLogging.getTypeEnum().ERROR,
          EventLogging.getFragmentEnum().EDITORS,
          err.message,
        );
      }
      NewToaster.show({
        message: err.message,
        intent: Intent.DANGER,
        iconName: 'pt-icon-thumbs-down',
      });
      this.createNewEditorFailed();
    }
  }

  @action.bound
  createNewEditorFailed() {
    this.store.editorPanel.creatingNewEditor = false;
    this.store.editorToolbar.newConnectionLoading = false;
  }

  // Setting up editor after successful response from Controller, it's more than possible some of these
  // states could be removed or refactored eventually. Worth checking out when time allows.
  @action.bound
  setNewEditorState(res, options = {}) {
    const { content = '' } = options;
    options = _.omit(options, ['content']);
    let fileName = `new${this.store.profiles.get(res.id).editorCount}.js`;
    if (options.type === 'aggregate') {
      fileName = 'Aggregate Builder';
    }

    const editorId = uuidV1();
    this.store.profiles.get(res.id).editorCount += 1;

    const doc = StaticApi.createNewDocumentObject(content);
    doc.lineSep = StaticApi.determineEol(content);

    this.store.editors.set(
      editorId,
      observable(
        _.assign(
          {
            id: editorId,
            alias: this.store.profiles.get(res.id).alias,
            profileId: res.id,
            shellId: res.shellId,
            currentProfile: res.id,
            fileName,
            executing: false,
            visible: true,
            shellVersion: res.shellVersion,
            initialMsg: res.output ? res.output.join('\n') : '',
            doc: observable.ref(doc),
            status: ProfileStatus.OPEN,
            path: null,
            type: options.type
          },
          options,
        ),
      ),
    );
    if (this.api) {
      this.api.addOutput(this.store.editors.get(editorId));
    }
    this.store.editorPanel.creatingNewEditor = false;
    this.store.editorToolbar.noActiveProfile = false;
    this.store.editorToolbar.id = res.id;
    this.store.editorToolbar.shellId = res.shellId;
    this.store.editorToolbar.newConnectionLoading = false;
    this.store.editorPanel.shouldScrollToActiveTab = true;
    this.store.editorPanel.activeEditorId = editorId;
    this.store.editorToolbar.currentProfile = res.id;
    this.store.editorToolbar.noActiveProfile = false;
    this.store.editorPanel.activeDropdownId = res.id;
    this.store.newConnectionLoading = false;
    this.store.editorToolbar.isActiveExecuting = false;

    if (this.store.editorToolbar.newEditorForTreeAction) {
      this.store.editorToolbar.newEditorForTreeAction = false;
      this.store.treeActionPanel.treeActionEditorId = editorId;
      const treeEditor = this.store.editors.get(editorId);
      if (treeEditor.type === EditorTypes.TREE_ACTION) {
        treeEditor.fileName = 'Tree Action';
      } else if (treeEditor.type === EditorTypes.SHELL_COMMAND) {
        treeEditor.fileName = 'Shell Command';
      }

      this.store.treeActionPanel.editors.set(editorId, treeEditor);
    }

    // Set left Panel State.
    if (options.type === EditorTypes.AGGREGATE) {
      this.store.drawer.drawerChild = DrawerPanes.AGGREGATE;
    } else if (options.type === EditorTypes.TREE_ACTION) {
      this.store.drawer.drawerChild = DrawerPanes.DYNAMIC;
    } else if (options.type === EditorTypes.SHELL_COMMAND) {
      this.store.drawer.drawerChild = DrawerPanes.BACKUP_RESTORE;
    } else {
      this.store.drawer.drawerChild = DrawerPanes.DEFAULT;
    }

    NewToaster.show({
      message: globalString('editor/toolbar/connectionSuccess'),
      intent: Intent.SUCCESS,
      iconName: 'pt-icon-thumbs-up',
    });
    return editorId;
  }

  @action.bound
  removeEditor(currEditor) {
    // @TODO -> Looks like during it's various reworks this entire function has been broken and stitched back together. Some refactoring needs to occur to ensure that when atab is closed a new tab is selected. @Mike.

    this.store.drawer.drawerChild = DrawerPanes.DEFAULT;
    console.log('deleted editor ', currEditor);
    // If Editor is not clean, prompt for save.
    if (!currEditor.doc.isClean() && currEditor.type != EditorTypes.SHELL_COMMAND) {
      this.store.editorPanel.showingSavingDialog = true;
      return;
    }

    // If the editor has an open shell, close it.
    if (currEditor && currEditor.status == ProfileStatus.OPEN) {
      featherClient()
        .service('/mongo-shells')
        .remove(currEditor.profileId, {
          query: {
            shellId: currEditor.shellId,
          },
        })
        .then(v => console.log('remove shell successfully, ', v))
        .catch(err => console.error('remove shell failed,', err));
    }

    // Check if the editor closing is the currently active editor.
    if (currEditor.id == this.store.editorPanel.activeEditorId) {
      this.store.editorPanel.isRemovingCurrentTab = true;
      // Check if this is the last tab:
      if (this.store.editors.size == 1) {
        // Show and select welcome tab
        this.store.welcomePage.isOpen = true;
        this.store.editorPanel.activeEditorId = 'Default';
      } else {
        // Show and select first entry in map.
        console.log('1:', this.store.editorPanel.activeEditorId);
        this.api.removeOutput(currEditor);
        this.store.editors.delete(currEditor.id);
        const editors = this.store.editors.entries();
        this.store.editorPanel.activeEditorId = editors[0][1].id;
        console.log('2:', this.store.editorPanel.activeEditorId);

        const treeEditor = this.store.treeActionPanel.editors.get(
          currEditor.id,
        );
        if (treeEditor) {
          this.store.treeActionPanel.editors.delete(treeEditor.id);
        }
        return;
      }
    } else {
      this.store.editorPanel.isRemovingCurrentTab = false;
    }
    this.api.removeOutput(currEditor);
    this.store.editors.delete(currEditor.id);
    const treeEditor = this.store.treeActionPanel.editors.get(
      currEditor.id,
    );
    if (treeEditor) {
      this.store.treeActionPanel.editors.delete(treeEditor.id);
    }
  }
  @action.bound
  addDrillEditor(profile, options = {}) {
    const content = '';
    const fileName = `new${this.store.profiles.get(profile.id).editorCount} (drill).js`;

    const editorId = uuidV1();
    this.store.profiles.get(profile.id).editorCount += 1;

    const doc = StaticApi.createNewDocumentObject(content);
    doc.lineSep = StaticApi.determineEol(content);

    this.store.editors.set(
      editorId,
      observable(
        _.assign(
          {
            id: editorId,
            alias: this.store.profiles.get(profile.id).alias,
            profileId: profile.id,
            shellId: options.shellId,
            currentProfile: profile.id,
            fileName,
            executing: false,
            visible: true,
            shellVersion: profile.shellVersion,
            initialMsg: '', // profile.output ? profile.output.join('\n') : '',
            doc: observable.ref(doc),
            status: ProfileStatus.OPEN,
            path: null,
            type: options.type
          },
          options,
        ),
      ),
    );
    if (this.api) {
      this.api.addDrillOutput(this.store.editors.get(editorId));
    }
    this.store.editorPanel.creatingNewEditor = false;
    this.store.editorToolbar.noActiveProfile = false;
    this.store.editorToolbar.id = profile.id;
    this.store.editorToolbar.shellId = options.shellId;
    this.store.editorToolbar.newConnectionLoading = false;
    this.store.editorPanel.shouldScrollToActiveTab = true;
    this.store.editorPanel.activeEditorId = editorId;
    this.store.editorToolbar.currentProfile = profile.id;
    this.store.editorToolbar.noActiveProfile = false;
    this.store.editorPanel.activeDropdownId = profile.id;
    this.store.newConnectionLoading = false;
    this.store.editorToolbar.isActiveExecuting = false;

    // Set left Panel State.
    if (options.type === EditorTypes.AGGREGATE) {
      this.store.drawer.drawerChild = DrawerPanes.AGGREGATE;
    } else if (options.type === EditorTypes.TREE_ACTION) {
      this.store.drawer.drawerChild = DrawerPanes.DYNAMIC;
    } else if (options.type === EditorTypes.SHELL_COMMAND) {
      this.store.drawer.drawerChild = DrawerPanes.BACKUP_RESTORE;
    } else {
      this.store.drawer.drawerChild = DrawerPanes.DEFAULT;
    }

    NewToaster.show({
      message: globalString('editor/toolbar/connectionSuccess'),
      intent: Intent.SUCCESS,
      iconName: 'pt-icon-thumbs-up',
    });
    return editorId;
  }
}
