const baseBtn = 'font-family: "Helvetica", "Arial", sans-serif; font-size: 14px; color: #fff; border: none; font-weight: 300; height: 30px; line-height: 30px; padding: 0 15px; text-align: center; min-width: 90px; text-decoration: none; text-transform: uppercase; text-overflow: ellipsis; white-space: nowrap; outline: none; cursor: pointer; border-radius: 15px;';

// eslint-disable-next-line import/prefer-default-export
export function initUI(options) {
  const cont = window.document.createElement('div');
  let style = 'font-family: "Helvetica", "Arial", sans-serif; bottom: 20px; right: 20px; padding: 10px; background-color: #fff; border: solid 1px #1976d2; box-shadow: 0px 1px 2px 0px rgba(0,0,0,0.5); border-radius: 3px;';
  style += ' z-index: 2147483647; position: fixed;';

  cont.setAttribute('style', style);
  cont.setAttribute('ignorelocizeeditor', '');
  cont.setAttribute('translated', '');
  //   if(options.locizeEditorToggle.containerClasses) {
  //     const classes = options.locizeEditorToggle.containerClasses.length > 1 ? options.locizeEditorToggle.containerClasses.split(' ') : options.locizeEditorToggle.containerClasses;
  //     classes.forEach(function(cssClass) {
  //       cont.classList.add(cssClass);
  //     });
  //   }

  const title = window.document.createElement('h4');

  title.id = 'locize-title';
  title.innerHTML = 'Translate InContext:';
  title.setAttribute(
    'style',
    'font-family: "Helvetica", "Arial", sans-serif; font-size: 14px; margin: 0 0 5px 0; color: #1976d2; font-weight: 300;'
  );
  title.setAttribute('ignorelocizeeditor', '');
  cont.appendChild(title);

  const turnOn = window.document.createElement('button');
  turnOn.innerHTML = 'Open in locize';
  turnOn.setAttribute('style', `${baseBtn}  background-color: #1976d2;`);
  turnOn.onclick = () => {
    const i18next = options.getI18next();

    const backendOptions = i18next && i18next.options && i18next.options.backend;
    const { projectId, version } = { ...backendOptions, ...options };

    const editorUrl = options.editorUrl || (backendOptions && backendOptions.loadPath && backendOptions.loadPath.indexOf('https://api-dev.locize.app') === 0 && 'https://dev.locize.app') || 'https://www.locize.app';

    window.location = `${editorUrl}/cat/${projectId}/v/${version}/incontext?sourceurl=${encodeURI(
      window.location.href
    )}`;
  };
  turnOn.setAttribute('ignorelocizeeditor', '');
  cont.appendChild(turnOn);

  window.document.body.appendChild(cont);
}
