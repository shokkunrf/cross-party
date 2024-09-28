const env = import.meta.env;

export const broker = {
  url: env.VITE_BROKER_URL as string,
  username: env.VITE_BROKER_USERNAME as string,
  password: env.VITE_BROKER_PASSWORD as string,
};
