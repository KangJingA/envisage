import React from 'react'
import Header
  from '@/components/shared/Header'
import TransformationForm from '@/components/shared/TransformationForm'
import { transformationTypes } from '@/constants'

const AddTransformationTypePage = ({ params: { type } }: SearchParamProps) => {

  const tranformation = transformationTypes[type];

  return (
    <>
      <Header
        title={tranformation.title}
        subtitle={tranformation.subTitle}
      />
      <TransformationForm />
    </>

  )
}

export default AddTransformationTypePage