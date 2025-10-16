import { Layout } from "@/components/layout/layout"
import { LoginHeader, LoginForm } from "@/components/auth"
import { useLogin } from "@/hooks"

export default function LoginPage() {
  const {
    formData,
    showPassword,
    isLoading,
    error,
    handleInputChange,
    handleSubmit,
    togglePasswordVisibility,
    handleForgotId,
    handleForgotPassword,
    handleSignup
  } = useLogin();

  return (
    <Layout currentPage="login" backgroundColor="bg-gray-50">
      {/* Login Section */}
      <section className="py-16">
        <div className="container mx-auto max-w-md px-6">
          <LoginHeader />
          
          <LoginForm
            formData={formData}
            showPassword={showPassword}
            isLoading={isLoading}
            error={error}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onTogglePassword={togglePasswordVisibility}
            onForgotId={handleForgotId}
            onForgotPassword={handleForgotPassword}
            onSignup={handleSignup}
          />
        </div>
      </section>
    </Layout>
  )
} 