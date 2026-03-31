export const isEmail = (email : string): boolean =>{
  return email.includes("@");
}

export const isNotEmpty = (value: string): boolean => {
  return value.trim() !== '';
}

export const hasMinLength = (value: string, minLength: number): boolean => {
  return value.length > minLength;
}

export const isEqualToOtherValue = (password: string, password2: string): boolean => {
  return password === password2;
}
