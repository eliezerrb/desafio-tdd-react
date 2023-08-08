import './styles.css';

import Pagination from 'components/Pagination';
import EmployeeCard from 'components/EmployeeCard';
import { Link } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { SpringPage } from 'types/vendor/spring';
import { Employee } from 'types/employee';
import { requestBackend } from 'util/requests';
import { AxiosRequestConfig } from 'axios';
import { hasAnyRoles } from 'util/auth';


// Guardar os dados dos componentes que controlam a listagem (Paginate e a busca) dados dos componentes de controle
type ControlComponentsData = {
  //número da página que está ativa, esse número vem do componente de paginção
  activePage: number;
};

const List = () => {

  const [page, setPage] = useState<SpringPage<Employee>>();

  // Vai manter os dados de todos os camponentes que fazem o controle da listagem
  const [controlComponentsData, setControlComponentsData] =
    useState<ControlComponentsData>({
      activePage: 0,
    });

  const handlePageChange = (pageNumber: number) => {
    setControlComponentsData({ activePage: pageNumber });
  };


  // useCallback - se for a mesma referencia da função não chamado de novo - feito para evitar o loop infinito do getProducts
  // dessa forma posso usar a função getProducts aproveitada em outros lugares como no delete
  const getEmployees = useCallback(() => {
    const config: AxiosRequestConfig = {
      method: 'GET',
      url: '/employees',
      withCredentials: true,
      params: {
        page: controlComponentsData.activePage,
        size: 3,
      },
    };


    requestBackend(config).then((response) => {
      setPage(response.data);
    });
  }, [controlComponentsData]);

  useEffect(() => {
    getEmployees();
  }, [getEmployees]);


  return (
    <>
      {hasAnyRoles(['ROLE_ADMIN']) && (
        <Link to="/admin/employees/create">
          <button className="btn btn-primary text-white btn-crud-add">
            ADICIONAR
          </button>
        </Link>
      )}

      <div className="row">
        {page?.content.map((employee) => (
          <div key={employee.id} className="col-sm-6 col-md-12">
            <EmployeeCard
              employee={employee}
            />
          </div>
        ))}
      </div>

      <Pagination
        forcePage={page?.number}
        pageCount={page ? page.totalPages : 0}
        range={3}
        onChange={handlePageChange}
      />
    </>
  );
};

export default List;
