interface Account {
  username: string
  admin: boolean
  loggedIn: boolean
  sessionToken: string
}

const account: Account = {
  username: 'nameless tee',
  admin: false,
  loggedIn: false,
  sessionToken: 'unset'
}

export const getAccount = (): Account => {
  return account
}
