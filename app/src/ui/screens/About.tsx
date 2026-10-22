import { isNative } from '../../platform/native';
import { useEffect, useState } from 'preact/hooks';
import { back } from '../../state/nav';
import { t } from '../../i18n/i18n';
import { Icon } from '../components/Icon';
import { Mark, TopBar } from '../components/common';
import { appVersion } from '../../platform/native';

export function About() {
  const [ver, setVer] = useState(__APP_VERSION__);
  useEffect(() => { void appVersion().then(setVer); }, []);
  const repo = `https://github.com/${__BRAND__.repo}`;
  return (
    <div class="screen">
      <TopBar title={t('about')} onBack={back} />
      <div class="scroll"><div class="wrap">
        <p class="about-lead">{t('aboutLead')}</p>
        <div class="group">
          <div class="panel">
            <div class="maker"><Mark /><div><span>{t('madeBy')}</span><b>{t('author')}</b><span>{t('authorLine')}</span></div></div>
            <a class="row link-row" href="mailto:site@hotmail.com"><Icon name="mail" class="lead" /><span class="lbl">{t('contact')}<small dir="ltr">site@hotmail.com</small></span></a>
            <a class="row link-row" href={repo} target="_blank" rel="noopener noreferrer"><Icon name="globe" class="lead" /><span class="lbl">{t('sourceCode')}<small dir="ltr">{repo.replace('https://', '')}</small></span></a>
          </div>
        </div>
        <div class="group">
          <h2>{t('privacy')}</h2>
          <div class="panel prose" style={{ padding: '16px' }}><p>{t(isNative || import.meta.env.MODE === 'capture' ? 'noData' : 'noDataWeb')}</p><p>{t('fictional')}</p></div>
        </div>
        <div class="group">
          <div class="panel prose" style={{ padding: '16px' }}><p>{t('generated')}</p><p>{t('licences')}</p></div>
        </div>
        <p class="note" style={{ justifyContent: 'center' }}><span>{t('version')} <span class="num" dir="ltr">{ver}</span></span></p>
      </div></div>
    </div>
  );
}
