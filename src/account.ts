interface Account {
  username: string
  loggedIn: boolean
  sessionToken: string
}

const account = {
  username: 'nameless tee',
  loggedIn: false,
  sessionToken: 'unset'
}

export const getAccount = (): Account => {
  return account
}
