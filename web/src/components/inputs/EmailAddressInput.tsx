import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/20/solid'

export interface EmailAddressInputProps {
  addresses: string[]
  placeholder?: string
  handleChange: (emails: string[]) => void
}

export default function EmailAddressInput(props: EmailAddressInputProps) {
  const { addresses, placeholder, handleChange } = props

  const [stash, setStash] = useState<string>('')

  const removeEmail = (email: string) => {
    const emails = addresses.filter((address) => address !== email)
    handleChange(emails)
  }

  const onBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value
    if (validateEmail(email)) {
      if (addresses.includes(email)) {
        return
      }
      const emails = [...addresses, email]
      setStash('')
      handleChange(emails)
    }
  }

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  return (
    <span className="flex items-center">
      {addresses.map((address) => {
        return (
          <span
            key={address}
            className="inline-flex items-center rounded bg-gray-100 dark:bg-gray-700 pl-2 pr-1 py-px ml-1 first:ml-0"
          >
            <span>{address}</span>
            <span
              className="p-0.5 cursor-pointer dark:hover:bg-gray-800 rounded-full ml-1 first-of-type:ml-0"
              onClick={() => {
                removeEmail(address)
              }}
            >
              <XMarkIcon className="w-4 h-4" />
            </span>
          </span>
        )
      })}

      <input
        type="text"
        className="outline-none bg-transparent w-full p-1 dark:placeholder:text-neutral-400"
        placeholder={placeholder}
        value={stash}
        onChange={(e) => {
          setStash(e.target.value)
        }}
        onBlur={onBlur}
      ></input>
    </span>
  )
}
