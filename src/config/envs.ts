import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
    PORT: number;
    DATABASE_URL: string;
}

const envsSchema = joi.object<EnvVars>({
    PORT: joi.number().required(),
    DATABASE_URL: joi.string().required(),
})
.unknown(true);

const { value, error } = envsSchema.validate(process.env);

if (error) {
    throw new Error(`Error validating envs: ${error.message}`);
}

const envVars: EnvVars = value;


export const envs = {
    PORT: envVars.PORT,
    DATABASE_URL: envVars.DATABASE_URL,
};
