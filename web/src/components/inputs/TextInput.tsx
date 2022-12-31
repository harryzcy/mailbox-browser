export interface EmailAddressInputProps {
  value: string
  placeholder?: string
  handleChange: (value: string) => void
}

export default function EmailAddressInput(props: EmailAddressInputProps) {
  const { value, placeholder, handleChange } = props

  return (
    <span>
      <input
        type="text"
        value={value}
        className="outline-none bg-transparent w-full p-1 dark:placeholder:text-neutral-400"
        placeholder={placeholder}
        onChange={(e) => {
          handleChange(e.target.value)
        }}
      ></input>
    </span>
  )
}
