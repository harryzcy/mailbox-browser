export async function invoke(pluginName: string, emailIDs: string[]) {
  await fetch(`/plugins/invoke`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: pluginName,
      messageIDs: emailIDs
    })
  })
}
