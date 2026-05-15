import { toast as baseToast } from "react-toastify"

const activeByKey = new Map()

function keyFrom(type, message, options = {}) {
  return options.toastId || `${type}:${String(message).slice(0, 90)}`
}

function show(type, message, options = {}) {
  const key = keyFrom(type, message, options)

  if (activeByKey.has(key) && baseToast.isActive(activeByKey.get(key))) {
    baseToast.update(activeByKey.get(key), {
      render: message,
      type,
      isLoading: false,
      autoClose: options.autoClose ?? 2800,
      closeButton: true,
      ...options,
    })
    return activeByKey.get(key)
  }

  const id = baseToast[type](message, {
    toastId: key,
    autoClose: options.autoClose ?? 2800,
    closeButton: true,
    pauseOnHover: true,
    pauseOnFocusLoss: false,
    ...options,
    onClose: (...args) => {
      activeByKey.delete(key)
      options.onClose?.(...args)
    },
  })

  activeByKey.set(key, id)
  return id
}

export const notify = {
  success: (message, options) => show("success", message, options),
  error: (message, options) => show("error", message, { autoClose: 4200, ...options }),
  warning: (message, options) => show("warning", message, options),
  warn: (message, options) => show("warning", message, options),
  info: (message, options) => show("info", message, options),
  loading: (message, options = {}) => {
    const key = keyFrom("loading", message, options)

    if (activeByKey.has(key) && baseToast.isActive(activeByKey.get(key))) {
      baseToast.update(activeByKey.get(key), {
        render: message,
        isLoading: true,
        autoClose: false,
        closeButton: false,
        ...options,
      })
      return activeByKey.get(key)
    }

    const id = baseToast.loading(message, {
      toastId: key,
      closeButton: false,
      pauseOnFocusLoss: false,
      ...options,
    })
    activeByKey.set(key, id)
    return id
  },
  update: (id, options = {}) => {
    const done = options.isLoading === false || options.type === "success" || options.type === "error" || options.type === "warning" || options.type === "info"
    return baseToast.update(id, {
      autoClose: done ? options.autoClose ?? 2800 : options.autoClose,
      closeButton: done ? true : options.closeButton,
      ...options,
    })
  },
  dismiss: (id) => baseToast.dismiss(id),
  isActive: (id) => baseToast.isActive(id),
}

export default notify
