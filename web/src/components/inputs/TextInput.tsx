export interface EmailAddressInputProps {
  placeholder?: string
  handleChange: (value: string) => void
}

export default function EmailAddressInput(props: EmailAddressInputProps) {
  const { placeholder, handleChange } = props

  return (
    <span>
      <input
        type="text"
        className="outline-none bg-transparent w-full p-1 dark:placeholder:text-neutral-400"
        placeholder={placeholder}
        onChange={(e) => {
          handleChange(e.target.value)
        }}
      ></input>
    </span>
  )
}
