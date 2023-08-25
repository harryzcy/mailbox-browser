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
        className="w-full bg-transparent p-1 outline-none dark:placeholder:text-neutral-400"
        placeholder={placeholder}
        onChange={(e) => {
          handleChange(e.target.value)
        }}
      ></input>
    </span>
  )
}
