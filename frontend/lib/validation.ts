// Frontend validation utilities and helpers

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Base validator interface
export interface Validator<T = any> {
  validate(value: T, field?: string): ValidationResult;
}

// Individual validation functions
export const validators = {
  required: (message?: string): Validator => ({
    validate: (value: any, field = 'field') => {
      const isEmpty = value === null || 
                     value === undefined || 
                     value === '' || 
                     (Array.isArray(value) && value.length === 0);
      
      return {
        isValid: !isEmpty,
        errors: isEmpty ? [{
          field,
          code: 'required',
          message: message || `${field}は必須項目です`,
          value
        }] : []
      };
    }
  }),

  minLength: (min: number, message?: string): Validator<string> => ({
    validate: (value: string, field = 'field') => {
      const isValid = typeof value === 'string' && value.length >= min;
      
      return {
        isValid,
        errors: !isValid ? [{
          field,
          code: 'min_length',
          message: message || `${field}は${min}文字以上入力してください`,
          value
        }] : []
      };
    }
  }),

  maxLength: (max: number, message?: string): Validator<string> => ({
    validate: (value: string, field = 'field') => {
      const isValid = typeof value === 'string' && value.length <= max;
      
      return {
        isValid,
        errors: !isValid ? [{
          field,
          code: 'max_length',
          message: message || `${field}は${max}文字以下で入力してください`,
          value
        }] : []
      };
    }
  }),

  email: (message?: string): Validator<string> => ({
    validate: (value: string, field = 'field') => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = typeof value === 'string' && emailRegex.test(value);
      
      return {
        isValid,
        errors: !isValid ? [{
          field,
          code: 'invalid_email',
          message: message || '有効なメールアドレスを入力してください',
          value
        }] : []
      };
    }
  }),

  oneOf: <T>(allowedValues: T[], message?: string): Validator<T> => ({
    validate: (value: T, field = 'field') => {
      const isValid = allowedValues.includes(value);
      
      return {
        isValid,
        errors: !isValid ? [{
          field,
          code: 'invalid_choice',
          message: message || `${field}は次のいずれかを選択してください: ${allowedValues.join(', ')}`,
          value
        }] : []
      };
    }
  }),

  latitude: (message?: string): Validator<number> => ({
    validate: (value: number, field = 'latitude') => {
      const isValid = typeof value === 'number' && value >= -90 && value <= 90;
      
      return {
        isValid,
        errors: !isValid ? [{
          field,
          code: 'invalid_latitude',
          message: message || '緯度は-90から90の間で入力してください',
          value
        }] : []
      };
    }
  }),

  longitude: (message?: string): Validator<number> => ({
    validate: (value: number, field = 'longitude') => {
      const isValid = typeof value === 'number' && value >= -180 && value <= 180;
      
      return {
        isValid,
        errors: !isValid ? [{
          field,
          code: 'invalid_longitude',
          message: message || '経度は-180から180の間で入力してください',
          value
        }] : []
      };
    }
  }),

  numeric: (message?: string): Validator<string | number> => ({
    validate: (value: string | number, field = 'field') => {
      const isValid = !isNaN(Number(value));
      
      return {
        isValid,
        errors: !isValid ? [{
          field,
          code: 'not_numeric',
          message: message || `${field}は数値を入力してください`,
          value
        }] : []
      };
    }
  }),

  range: (min: number, max: number, message?: string): Validator<number> => ({
    validate: (value: number, field = 'field') => {
      const isValid = typeof value === 'number' && value >= min && value <= max;
      
      return {
        isValid,
        errors: !isValid ? [{
          field,
          code: 'out_of_range',
          message: message || `${field}は${min}から${max}の間で入力してください`,
          value
        }] : []
      };
    }
  }),

  pattern: (regex: RegExp, message?: string): Validator<string> => ({
    validate: (value: string, field = 'field') => {
      const isValid = typeof value === 'string' && regex.test(value);
      
      return {
        isValid,
        errors: !isValid ? [{
          field,
          code: 'invalid_pattern',
          message: message || `${field}の形式が正しくありません`,
          value
        }] : []
      };
    }
  }),

  custom: <T>(validatorFn: (value: T) => boolean, message: string, code = 'custom_validation'): Validator<T> => ({
    validate: (value: T, field = 'field') => {
      const isValid = validatorFn(value);
      
      return {
        isValid,
        errors: !isValid ? [{
          field,
          code,
          message,
          value
        }] : []
      };
    }
  })
};

// Schema-based validation
export interface ValidationSchema {
  [field: string]: Validator[];
}

export function validateSchema<T extends Record<string, any>>(
  data: T, 
  schema: ValidationSchema
): ValidationResult {
  const allErrors: ValidationError[] = [];

  for (const [field, fieldValidators] of Object.entries(schema)) {
    const value = data[field];
    
    for (const validator of fieldValidators) {
      const result = validator.validate(value, field);
      if (!result.isValid) {
        allErrors.push(...result.errors);
      }
    }
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
}

// Course-specific validation schemas
export const courseValidationSchemas = {
  suggestions: {
    courseType: [
      validators.required('コースタイプを選択してください'),
      validators.oneOf(['walking', 'cycling', 'jogging'], '有効なコースタイプを選択してください')
    ],
    distance: [
      validators.required('距離を選択してください'),
      validators.oneOf(['short', 'medium', 'long'], '有効な距離を選択してください')
    ],
    'location.latitude': [
      validators.latitude()
    ],
    'location.longitude': [
      validators.longitude()
    ],
    'preferences.scenery': [
      validators.oneOf(['nature', 'urban', 'mixed'], '有効な景観タイプを選択してください')
    ],
    'preferences.difficulty': [
      validators.oneOf(['easy', 'moderate', 'hard'], '有効な難易度を選択してください')
    ]
  },

  details: {
    'suggestion.id': [
      validators.required('コースIDが必要です'),
      validators.minLength(1, 'コースIDを指定してください')
    ],
    'suggestion.title': [
      validators.required('コースタイトルが必要です'),
      validators.minLength(1, 'コースタイトルを指定してください')
    ],
    'suggestion.courseType': [
      validators.required('コースタイプが必要です'),
      validators.oneOf(['walking', 'cycling', 'jogging'], '有効なコースタイプを指定してください')
    ],
    'suggestion.startPoint.latitude': [
      validators.latitude()
    ],
    'suggestion.startPoint.longitude': [
      validators.longitude()
    ]
  }
};

// Utility functions for nested object validation
export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

export function validateNestedSchema<T extends Record<string, any>>(
  data: T, 
  schema: ValidationSchema
): ValidationResult {
  const allErrors: ValidationError[] = [];

  for (const [fieldPath, fieldValidators] of Object.entries(schema)) {
    const value = getNestedValue(data, fieldPath);
    
    for (const validator of fieldValidators) {
      const result = validator.validate(value, fieldPath);
      if (!result.isValid) {
        allErrors.push(...result.errors);
      }
    }
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
}

// Form validation hook for React components
export function useFormValidation<T extends Record<string, any>>(
  initialData: T,
  schema: ValidationSchema
) {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback((field: string, value: any) => {
    if (schema[field]) {
      const fieldValidators = schema[field];
      const fieldErrors: ValidationError[] = [];

      for (const validator of fieldValidators) {
        const result = validator.validate(value, field);
        if (!result.isValid) {
          fieldErrors.push(...result.errors);
        }
      }

      setErrors(prev => [
        ...prev.filter(error => error.field !== field),
        ...fieldErrors
      ]);

      return fieldErrors.length === 0;
    }
    return true;
  }, [schema]);

  const validateAll = useCallback(() => {
    const result = validateNestedSchema(data, schema);
    setErrors(result.errors);
    return result.isValid;
  }, [data, schema]);

  const updateField = useCallback((field: string, value: any) => {
    setData(prev => {
      const newData = { ...prev } as any;
      const keys = field.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData as T;
    });

    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate field if it has been touched
    if (touched[field]) {
      validateField(field, value);
    }
  }, [validateField, touched]);

  const getFieldError = useCallback((field: string) => {
    return errors.find(error => error.field === field);
  }, [errors]);

  const hasFieldError = useCallback((field: string) => {
    return touched[field] && !!getFieldError(field);
  }, [getFieldError, touched]);

  const reset = useCallback(() => {
    setData(initialData);
    setErrors([]);
    setTouched({});
  }, [initialData]);

  return {
    data,
    errors,
    touched,
    updateField,
    validateField,
    validateAll,
    getFieldError,
    hasFieldError,
    reset,
    isValid: errors.length === 0
  };
}

// Import React for hooks
import { useState, useCallback } from 'react';