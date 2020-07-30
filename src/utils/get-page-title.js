import defaultSettings from '@/settings'

const title = defaultSettings.title || '济世公匠'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
