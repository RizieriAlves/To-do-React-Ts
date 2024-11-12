import "./CreateTask.css";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa6";
import { FaPencilAlt } from "react-icons/fa";

const CreateTask = () => {
  const [taskName, setTaskName] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [tasks, setTasks] = useState<{ name: string; date: string }[]>([]);
  const [indexEdit, setIndexEdit] = useState<number | null>(null);
  const [edit, setEdit] = useState<boolean>(false);

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

    const task: { name: string; date: string } = {
      name: taskName,
      date: date,
    };

    setTasks((tasks) => [...tasks, task]);
    setDate("");
    setTaskName("");
  };

  const handleEdit = (index: number) => {
    const task: { name: string; date: string } = {
      name: taskName,
      date: date,
    };
    const newTaskList: { name: string; date: string }[] = [...tasks];
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
    if (localStorage.length == 0) {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    } else {
      getLS();
    }
  }, []);

  useEffect(() => {
    saveLS();
  }, [tasks]);

  const saveLS = () => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  };

  const getLS = async () => {
    const data = await localStorage.getItem("tasks");
    if (data != null) {
      setTasks(JSON.parse(data));
    }
  };

  const renderTasks = () => {
    let task_order: { name: string; date: string }[] = [];
    if (tasks.length > 1) {
      task_order = tasks.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
    } else {
      task_order = tasks;
    }
    //Ordenação

    if (task_order.length != 0) {
      return task_order?.map((task, index) => {
        return (
          <div>
            <div key={index} className="task">
              <span>{task.name}</span>
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
      });
    } else {
      return (
        <div>
          <h3>Sem tarefas no momento</h3>
        </div>
      );
    }
  };

  return (
    <>
      {indexEdit == null && (
        <div className="createtask_container">
          <form
            onSubmit={async (e) => {
              await handleSubmit(e);
            }}
          >
            <h2>O que você vai fazer?</h2>
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
            <input type="submit" value="Adicionar" />
          </form>
        </div>
      )}

      <div className="tasks_container">
        <h2>Tarefas</h2>
        {renderTasks()}
      </div>
    </>
  );
};

export default CreateTask;
