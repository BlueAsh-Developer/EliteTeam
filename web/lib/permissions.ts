export const PERMISSIONS = {
  chat: {
    send: 'chat.send',
    voiceMessage: 'chat.voiceMessage',
    bold: 'chat.bold',
    italics: 'chat.italics',
    emoji: 'chat.emoji',
    threads: 'chat.threads',
    mentions: 'chat.mentions',
    deleteAny: 'chat.deleteAny',
    pin: 'chat.pin',
    react: 'chat.react',
    editOwn: 'chat.editOwn',
    deleteOwn: 'chat.deleteOwn',
    markdown: 'chat.markdown',
    codeBlocks: 'chat.codeBlocks',
    attachments: 'chat.attachments',
    formatting: 'chat.formatting',
    polls: 'chat.polls',
    embeds: 'chat.embeds',
  },
  voice: {
    call: 'voice.call',
    group: 'voice.call.group',
    mute: 'voice.mute',
    record: 'voice.record',
    screenShare: 'voice.screenShare',
    backgroundNoise: 'voice.backgroundNoise',
    transcript: 'voice.transcript',
    raiseHand: 'voice.raiseHand',
  },
  video: {
    call: 'video.call',
    screenShare: 'video.screenShare',
    react: 'video.react',
    virtualBackground: 'video.virtualBackground',
    record: 'video.record',
    transcript: 'video.transcript',
    breakout: 'video.breakout',
    handRaise: 'video.handRaise',
  },
  browse: {
    sessionCreate: 'browse.session.create',
    sessionJoin: 'browse.session.join',
    control: 'browse.control',
    urlNavigate: 'browse.url.navigate',
    download: 'browse.download',
    clipboard: 'browse.clipboard',
    screenshots: 'browse.screenshots',
    incognito: 'browse.incognito',
    extensions: 'browse.extensions',
  },
  plugins: {
    install: 'plugins.install',
    uninstall: 'plugins.uninstall',
    configure: 'plugins.configure',
    customCreate: 'plugins.custom.create',
    customEdit: 'plugins.custom.edit',
    customDelete: 'plugins.custom.delete',
    marketplace: 'plugins.marketplace',
    update: 'plugins.update',
  },
  roles: {
    view: 'roles.view',
    create: 'roles.create',
    edit: 'roles.edit',
    assign: 'roles.assign',
    delete: 'roles.delete',
    managePermissions: 'roles.managePermissions',
    inherit: 'roles.inherit',
  },
  admin: {
    billing: 'admin.billing',
    settings: 'admin.settings',
    invite: 'admin.invite',
    removeMember: 'admin.removeMember',
    audit: 'admin.audit',
    apiKeys: 'admin.apiKeys',
    integrations: 'admin.integrations',
    sso: 'admin.sso',
    branding: 'admin.branding',
    export: 'admin.export',
  },
  account: {
    profile: 'account.profile',
    export: 'account.export',
    delete: 'account.delete',
    twoFactor: 'account.twoFactor',
    sessions: 'account.sessions',
    notifications: 'account.notifications',
  },
  workspace: {
    create: 'workspace.create',
    delete: 'workspace.delete',
    rename: 'workspace.rename',
    transfer: 'workspace.transfer',
    archive: 'workspace.archive',
  },
}

export type PermissionCategory = keyof typeof PERMISSIONS
export type PermissionKey = string

export const PERMISSION_GROUPS: Record<PermissionCategory, string> = {
  chat: 'Chat',
  voice: 'Voice',
  video: 'Video',
  browse: 'Browse',
  plugins: 'Plugins',
  roles: 'Roles',
  admin: 'Admin',
  account: 'Account',
  workspace: 'Workspace',
}

export function flattenPermissions(obj: Record<string, unknown>, prefix = ''): Record<string, boolean> {
  const out: Record<string, boolean> = {}
  for (const key of Object.keys(obj)) {
    const value = obj[key]
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'boolean') {
      out[fullKey] = value
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(out, flattenPermissions(value as Record<string, unknown>, fullKey))
    }
  }
  return out
}

export function expandPermissions(flat: Record<string, boolean>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.')
    let current = out
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      if (!(part in current)) {
        current[part] = {}
      }
      current = current[part] as Record<string, unknown>
    }
    current[parts[parts.length - 1]] = value
  }
  return out
}

export function can(member: { permissions: Record<string, boolean> }, key: string): boolean {
  return member.permissions[key] === true
}

export function defaultPermissionsForRole(role: 'owner' | 'admin' | 'member' | 'viewer'): Record<string, boolean> {
  const allChat = ['chat.send', 'chat.voiceMessage', 'chat.bold', 'chat.italics', 'chat.emoji', 'chat.threads', 'chat.mentions', 'chat.react', 'chat.editOwn', 'chat.deleteOwn', 'chat.markdown', 'chat.codeBlocks', 'chat.attachments', 'chat.formatting', 'chat.polls', 'chat.embeds']
  const allVoice = ['voice.call', 'voice.call.group', 'voice.mute', 'voice.record', 'voice.screenShare', 'voice.transcript', 'voice.raiseHand']
  const allVideo = ['video.call', 'video.screenShare', 'video.react', 'voice.virtualBackground', 'video.record', 'video.transcript', 'video.breakout', 'video.handRaise']
  const allBrowse = ['browse.session.create', 'browse.session.join', 'browse.control', 'browse.url.navigate', 'browse.download', 'browse.clipboard', 'browse.screenshots']
  const allPlugins = ['plugins.install', 'plugins.uninstall', 'plugins.configure', 'plugins.marketplace', 'plugins.update']
  const allRoles = ['roles.view', 'roles.create', 'roles.edit', 'roles.assign', 'roles.delete', 'roles.managePermissions']
  const allAdmin = ['admin.billing', 'admin.settings', 'admin.invite', 'admin.removeMember', 'admin.audit', 'admin.apiKeys', 'admin.integrations', 'admin.branding', 'admin.export']
  const allAccount = ['account.profile', 'account.export', 'account.sessions', 'account.notifications']
  const allWorkspace = ['workspace.create', 'workspace.rename', 'workspace.transfer', 'workspace.archive']

  const trueArr = (arr: string[]) => Object.fromEntries(arr.map(k => [k, true]))
  const falseArr = (arr: string[]) => Object.fromEntries(arr.map(k => [k, false]))

  if (role === 'owner') {
    return {
      ...trueArr(allChat),
      ...trueArr(allVoice),
      ...trueArr(allVideo),
      ...trueArr(allBrowse),
      ...trueArr(allPlugins),
      ...trueArr(allRoles),
      ...trueArr(allAdmin),
      ...trueArr(allAccount),
      ...trueArr(allWorkspace),
    }
  }
  if (role === 'admin') {
    return {
      ...trueArr(allChat),
      ...trueArr(allVoice),
      ...trueArr(allVideo),
      ...trueArr(allBrowse),
      ...trueArr(allPlugins),
      ...trueArr(allRoles),
      ...trueArr(allAdmin),
      ...trueArr(allAccount),
      ...falseArr(allWorkspace),
    }
  }
  if (role === 'member') {
    return {
      ...trueArr(allChat),
      ...trueArr(allVoice),
      ...trueArr(allVideo),
      ...trueArr(allBrowse),
      ...falseArr(allPlugins),
      ...falseArr(allRoles),
      ...falseArr(allAdmin),
      ...trueArr(allAccount),
      ...falseArr(allWorkspace),
    }
  }
  return {
    ...trueArr(['chat.send', 'chat.voiceMessage', 'chat.emoji', 'chat.threads', 'chat.mentions', 'chat.react', 'chat.markdown', 'chat.codeBlocks', 'chat.attachments', 'chat.formatting']),
    ...falseArr(allVoice),
    ...falseArr(allVideo),
    ...falseArr(allBrowse),
    ...falseArr(allPlugins),
    ...falseArr(allRoles),
    ...falseArr(allAdmin),
    ...trueArr(allAccount),
    ...falseArr(allWorkspace),
  }
}
