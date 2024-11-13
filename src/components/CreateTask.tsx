import "./CreateTask.css";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa6";
import { FaPencilAlt } from "react-icons/fa";

const CreateTask = () => {
  const [taskName, setTaskName] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [tasks, setTasks] = useState<
    { name: string; date: string; category: string }[]
  >([]);
  const [indexEdit, setIndexEdit] = useState<number | null>(null);
  const [edit, setEdit] = useState<boolean>(false);

  const [newCategory, setNewCategory] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>("");
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [filterDate, setFilterDate] = useState<string | null>("Todo o período");

  //Feito desta forma pois devido ao fuso, era reduzido um dia no transformação com toLocaleDateString()
  const formatDate = (date: string) => {
    const [ano, mes, dia] = date.split("-");
    return (
      <p>
        {dia}/{mes}/{ano}
      </p>
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const task: { name: string; date: string; category: string } = {
      name: taskName,
      date: date,
      category: category,
    };

    setTasks((tasks) => [...tasks, task]);
    setDate("");
    setTaskName("");
  };

  const handleEdit = (index: number) => {
    const task: { name: string; date: string; category: string } = {
      name: taskName,
      date: date,
      category: category,
    };
    const newTaskList: { name: string; date: string; category: string }[] = [
      ...tasks,
    ];
    newTaskList[index] = task;
    setDate("");
    setTaskName("");
    setIndexEdit(null);
    return setTasks(newTaskList);
  };

  const handleCancel = () => {
    setIndexEdit(null);
    setTaskName("");
    setDate("");
  };

  const handleDelete = (index: number) => {
    setTasks((tasks) => {
      const newTaskList = [...tasks];
      newTaskList.splice(index, 1);
      return newTaskList;
    });
  };

  useEffect(() => {
    const tasksLS = localStorage.getItem("tasks");
    const categoriesLS = localStorage.getItem("categories");
    if (tasksLS) {
      setTasks(JSON.parse(tasksLS));
    }
    if (categoriesLS) {
      setCategories(JSON.parse(categoriesLS));
    }
  }, []);

  useEffect(() => {
    saveLS();
  }, [tasks, categories]);

  const saveLS = () => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("categories", JSON.stringify(categories));
  };

  //Check filters, set tasks order, render tasks
  const renderTasks = (category: string | null, date: number | null) => {
    //Check category filter
    let category_tasks: { name: string; date: string; category: string }[] = [];
    if (category) {
      tasks.forEach((task) => {
        if (task.category === category) {
          category_tasks.push(task);
        }
      });
    } else {
      category_tasks = tasks;
    }

    //Check data filter
    let final_tasks: { name: string; date: string; category: string }[] = [];
    const date_now: Date = new Date(Date.now());
    const month = date_now.getMonth();
    const day = date_now.getDay();
    const daysUntilSunday = (7 - day) % 7;
    const nextSunday = new Date(
      Date.now() + daysUntilSunday * 1000 * 60 * 60 * 24
    );
    nextSunday.setHours(0, 0, 0, 0);
    const toNextSunday = new Date(
      nextSunday.getTime() + 7 * 24 * 60 * 60 * 1000
    );

    switch (date) {
      case 0:
        final_tasks = category_tasks;
        break;
      case 1:
        category_tasks.forEach((task) => {
          if (new Date(task.date).getMonth() == month) {
            final_tasks.push(task);
          }
        });
        break;
      case 2:
        if (month == 12) {
          category_tasks.forEach((task) => {
            if (new Date(task.date).getMonth() == 1) {
              final_tasks.push(task);
            }
          });
        } else {
          category_tasks.forEach((task) => {
            if (new Date(task.date).getMonth() == month + 1) {
              final_tasks.push(task);
            }
          });
        }
        break;
      case 3:
        category_tasks.forEach((task) => {
          if (new Date(task.date) < nextSunday) {
            final_tasks.push(task);
          }
        });
        break;
      case 4:
        category_tasks.forEach((task) => {
          if (
            nextSunday < new Date(task.date) &&
            new Date(task.date) < toNextSunday
          ) {
            final_tasks.push(task);
          }
        });
        break;
      default:
        final_tasks = category_tasks;
        break;
    }

    //Ordenação
    let task_order: { name: string; date: string; category: string }[] = [];
    if (final_tasks.length > 1) {
      task_order = final_tasks.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
    } else {
      task_order = final_tasks;
    }

    if (task_order.length != 0) {
      return (
        <>
          <div className="task">
            <span>Nome:</span>
            <span>Categoria</span>
            <span>Dia:</span>
            <span></span>
            <span></span>
          </div>

          {task_order?.map((task, index) => {
            return (
              <div>
                <div key={index} className="task">
                  <span>{task.name}</span>
                  <span>{task.category}</span>
                  <span>Dia: {formatDate(task.date)}</span>
                  <FaPencilAlt
                    onClick={() => {
                      setIndexEdit(index);
                      setEdit(!edit);
                    }}
                  />
                  <FaTrash
                    onClick={() => {
                      handleDelete(index);
                    }}
                  />
                </div>
                {indexEdit == index && (
                  <form
                    onSubmit={() => {
                      handleEdit(index);
                    }}
                    className="editForm"
                  >
                    <label>
                      <h4>Titulo:</h4>
                      <input
                        type="text"
                        placeholder="Digite o novo nome da tarefa"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          setTaskName(e.target.value);
                        }}
                        required
                      />
                    </label>
                    <label>
                      <h4>Prazo/Dia:</h4>
                      <input
                        type="date"
                        required
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          setDate(e.target.value);
                        }}
                      />
                    </label>
                    <label className="category">
                      <p>Categoria:</p>
                      <select
                        required
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                          setCategory(e.target.value);
                        }}
                      >
                        <option value="-">-</option>
                        {categories &&
                          categories.map((category) => {
                            return <option>{category}</option>;
                          })}
                      </select>
                    </label>
                    <button value="Editar">
                      <p>Editar</p>
                    </button>
                    <button
                      onClick={() => {
                        handleCancel();
                      }}
                    >
                      <p>Cancelar</p>
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </>
      );
    } else {
      return (
        <div>
          <h3>Sem tarefas no momento</h3>
        </div>
      );
    }
  };

  const addCategory = () => {
    const categories_ = [...categories, newCategory];
    setCategories(categories_);
    setNewCategory("");
  };

  const handleDeleteCategory = (index: number) => {
    setCategories((categories) => {
      const newCategoryList = [...categories];
      newCategoryList.splice(index, 1);
      return newCategoryList;
    });
  };

  return (
    <>
      <div className="task_categories">
        {indexEdit == null && (
          <div className="createtask_container">
            <form
              onSubmit={async (e) => {
                await handleSubmit(e);
              }}
            >
              <h2>Inclua uma nova Tarefa</h2>
              <label>
                <p>Titulo:</p>
                <input
                  value={taskName}
                  type="text"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setTaskName(e.target.value);
                  }}
                  required
                  placeholder="Titulo da tarefa"
                />
              </label>
              <label>
                <p>Prazo/Dia:</p>
                <input
                  type="date"
                  value={date}
                  required
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setDate(e.target.value);
                  }}
                />
              </label>
              <label className="category">
                <p>Categoria:</p>
                <select
                  required
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                    setCategory(e.target.value);
                  }}
                >
                  <option value="-">-</option>
                  {categories &&
                    categories.map((category) => {
                      return <option>{category}</option>;
                    })}
                </select>
              </label>
              <input type="submit" value="Adicionar" />
            </form>
          </div>
        )}

        <div className="categories_container">
          <h2>Categorias</h2>
          <div>
            <p>Nova categoria?</p>
            <input
              type="text"
              placeholder="Nome da categoria"
              value={newCategory}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setNewCategory(e.target.value);
              }}
            />
            <button
              type="button"
              onClick={() => {
                addCategory();
                saveLS();
              }}
            >
              Add
            </button>
          </div>
          {categories.map((category, index) => {
            return (
              <div className="category_item">
                <p>{category}</p>
                <span
                  onClick={() => {
                    handleDeleteCategory(index);
                  }}
                >
                  <FaTrash />
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="tasks_container">
        <h2>Tarefas</h2>
        <span className="selected_filter">
          <ul>
            Filtros:
            <li>{selectedCategory}</li>
            <li>{filterDate}</li>
          </ul>
        </span>
        <div className="filters">
          <span
            onClick={() => {
              setSelectedDate(1);
              setFilterDate("Este mês");
            }}
          >
            Este mês
          </span>
          <span
            onClick={() => {
              setSelectedDate(2);
              setFilterDate("Próximo mês");
            }}
          >
            Próximo mês
          </span>
          <span
            onClick={() => {
              setSelectedDate(3);
              setFilterDate("Esta semana");
            }}
          >
            Esta semana
          </span>
          <span
            onClick={() => {
              setSelectedDate(4);
              setFilterDate("Semana que vem");
            }}
          >
            Semana que vem
          </span>
          <span
            onClick={() => {
              setSelectedDate(0);
              setFilterDate("Todo o período");
            }}
          >
            Todo período
          </span>
          <select
            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
              setSelectedCategory(e.target.value);
            }}
          >
            <option value="">Todas as categorias</option>
            {categories &&
              categories.map((category) => {
                return <option value={category}>{category}</option>;
              })}
          </select>
        </div>
        {renderTasks(selectedCategory, selectedDate)}
      </div>
    </>
  );
};

export default CreateTask;
