import React from 'react'
import Header
  from '@/components/shared/Header'
import TransformationForm from '@/components/shared/TransformationForm'
import { transformationTypes } from '@/constants'
import { auth } from '@clerk/nextjs/server'
import { getUserById } from '@/lib/actions/user.actions'
import { redirect } from 'next/navigation';

const AddTransformationTypePage = async ({ params: { type } }: SearchParamProps) => {

  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  const user = await getUserById(userId); // get user from db
  const tranformation = transformationTypes[type];

  return (
    <>
      <Header
        title={tranformation.title}
        subtitle={tranformation.subTitle}
      />
      <section className='mt-10'>
        <TransformationForm
          action="Add"
          userId={user._id}
          type={tranformation.type as TransformationTypeKey}
          creditBalance={user.creditBalance}
        />
      </section>

    </>
  )
}

export default AddTransformationTypePage