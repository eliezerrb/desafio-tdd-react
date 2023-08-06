import './styles.css';
import { useHistory, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Employee } from 'types/employee';
import Select from 'react-select';
import { Department } from 'types/department';
import { useEffect, useState } from 'react';
import { requestBackend } from 'util/requests';
import { AxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';

type UrlParams = {
  employeeId: string;
};

const Form = () => {

  // Capturar parâmetros de URL
  const { employeeId } = useParams<UrlParams>();

  // Se o parâmetros de URL for diferente de create então está editando
  const isEditing = employeeId !== 'create';

  const history = useHistory();

  const [selectDepartment, setSelectDepartment] = useState<Department[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm<Employee>();


  useEffect(() => {
    requestBackend({ url: '/departments',  withCredentials: true }).then((response) => {
      //.content porque a busca é paginada
      setSelectDepartment(response.data);
    });
  }, []);


   // Para carregar os dados no formulário de acordo com o id passado na URL
   useEffect(() => {
    if (isEditing) {
      requestBackend({ url: `/employees/${employeeId}` }).then((response) => {
        const employee = response.data as Employee;

        setValue('name', employee.name);
        setValue('email', employee.email);
        setValue('department', employee.department);
      });
    }
  }, [isEditing, employeeId, setValue]);


  const onSubmit = (formData: Employee) => {
    const data = {
      ...formData
    };

    const config: AxiosRequestConfig = {
      method: isEditing ? 'PUT' : 'POST',
      url: isEditing ? `/employees/${employeeId}` : '/employees',
      data: data,
      withCredentials: true,
    };

    requestBackend(config)
    .then(() => {
      toast.info('Cadastrado com sucesso');
      history.push('/admin/employees');
    })
    .catch(() => {
      toast.error('Erro ao cadastrar');
    });

  };

    const handleCancel = () => {
      history.push('/admin/employees');
    };

    return (
      <div className="employee-crud-container">
        <div className="base-card employee-crud-form-card">
          <h1 className="employee-crud-form-title">INFORME OS DADOS</h1>

          <form onSubmit={handleSubmit(onSubmit)} data-testid="form">
            <div className="row employee-crud-inputs-container">
              <div className="col employee-crud-inputs-left-container">

                <div className="margin-bottom-30">
                  <input
                    {...register('name', {
                      required: 'Campo obrigatório',
                    })}
                    type="text"
                    className={`form-control base-input ${errors.name ? 'is-invalid' : ''
                      }`}
                    placeholder="Nome do empregado"
                    name="name"
                    data-testid="name"
                  />
                  <div className="invalid-feedback d-block">
                    {errors.name?.message}
                  </div>
                </div>

                <div className="margin-bottom-30">
                  <input
                    {...register('email', {
                      required: 'Campo obrigatório',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email inválido',
                      },
                    })}
                    type="text"
                    className={`form-control base-input 
                      ${errors.email ? 'is-invalid' : ''
                    }`}
                    placeholder="email do colaborador"
                    name="email"
                    data-testid="email"
                  />
                  <div className="invalid-feedback d-block">
                    {errors.email?.message}
                  </div>
                </div>


                <div className="margin-bottom-30">
                {/*label só foi utilizado para pegar o conteudo do componente select no teste */}
                {/*d-none - classe do bootStrap para não aparecer o texto Categorias do label*/}
                <label htmlFor="department" className="d-none">Departamento</label>
                <Controller
                  name="department"
                  rules={{ required: true }}
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={selectDepartment}
                      classNamePrefix="product-crud-select"
                      getOptionLabel={(department: Department) => department.name}
                      getOptionValue={(department: Department) =>
                        String(department.id)
                      }
                      inputId="department"
                    />
                  )}
                />
                {errors.department && (
                  <div className="invalid-feedback d-block">
                    Campo obrigatório
                  </div>
                )}
              </div>

              </div>
            </div>
            <div className="employee-crud-buttons-container">
              <button
                className="btn btn-outline-danger employee-crud-button"
                onClick={handleCancel}
              >
                CANCELAR
              </button>
              <button className="btn btn-primary employee-crud-button text-white">
                SALVAR
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  export default Form;
