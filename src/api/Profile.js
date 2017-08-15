/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-07-31T13:06:24+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-07-31T16:13:21+10:00
 */

import { action, observable } from 'mobx';
import uuidV1 from 'uuid';
import StaticApi from './static';

export default class ProfileApi {
  store;
  api;

  constructor(store, api) {
    this.store = store;
    this.api = api;

    this.profileCreated = this.profileCreated.bind(this);
  }

  /**
    * called when there is new connection profile get created.
    *
    * @param profile the newly created connection profile
    */
  @action
  profileCreated(profile) {
    const { editors, editorToolbar, editorPanel } = this.store;
    let targetEditor = null;
    for (const editor of editors.values()) {
      if (profile.id === editor.profileId) {
        targetEditor = editor;
        break;
      }
    }
    if (!targetEditor) {
      const content = '';
      const doc = StaticApi.createNewDocumentObject(content);
      doc.lineSep = StaticApi.determineEol(content);

      const fileName = `new${profile.editorCount}.js`;
      const editorId = uuidV1();
      profile.editorCount += 1;
      editors.set(
        editorId,
        observable({
          id: editorId,
          alias: profile.alias,
          profileId: profile.id,
          shellId: profile.shellId,
          currentProfile: profile.id,
          fileName,
          visible: true,
          executing: false,
          shellVersion: profile.shellVersion,
          initialMsg: profile.initialMsg,
          doc: observable.ref(doc),
          status: profile.status,
          path: null,
          type: 'shell',
        }),
      );
      if (this.api) {
        this.api.addOutput(this.store.editors.get(editorId));
      }
      editorPanel.shouldScrollToActiveTab = true;
      editorPanel.activeEditorId = editorId;
    } else if (targetEditor.id !== editorPanel.activeEditorId) {
      editorPanel.shouldScrollToActiveTab = true;
      editorPanel.activeEditorId = targetEditor.id;
    }

    editorToolbar.noActiveProfile = false;
    editorToolbar.id = profile.id;
    editorToolbar.shellId = profile.shellId;
    editorToolbar.newConnectionLoading = false;
    editorPanel.activeDropdownId = profile.id;
    editorToolbar.currentProfile = profile.id;
    editorToolbar.noActiveProfile = false;
  }
}