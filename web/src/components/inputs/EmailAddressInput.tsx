import { XMarkIcon } from '@heroicons/react/20/solid'
import { useState } from 'react'

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
            className="ml-1 inline-flex items-center rounded bg-gray-100 py-px pl-2 pr-1 first:ml-0 dark:bg-neutral-700"
          >
            <span>{address}</span>
            <span
              className="ml-1 cursor-pointer rounded-full p-0.5 first-of-type:ml-0 dark:hover:bg-neutral-800"
              onClick={() => {
                removeEmail(address)
              }}
            >
              <XMarkIcon className="h-4 w-4" />
            </span>
          </span>
        )
      })}

      <input
        type="text"
        className="w-full bg-transparent p-1 outline-none dark:placeholder:text-neutral-400"
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
