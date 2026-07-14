import { useState } from "react";
import "./Teams.css";

function Teams() {
  const [search, setSearch] = useState("");

  const [members, setMembers] = useState([
    {
      id: 1,
      name: "John Doe",
      role: "Frontend Developer",
      team: "Frontend",
      email: "john@company.com",
      status: "Active",
    },
    {
      id: 2,
      name: "Sarah Smith",
      role: "Backend Developer",
      team: "Backend",
      email: "sarah@company.com",
      status: "Active",
    },
  ]);

  const [newMember, setNewMember] = useState({
    name: "",
    role: "",
    team: "",
    email: "",
    status: "Active",
  });

  const addMember = () => {
    if (
      !newMember.name ||
      !newMember.role ||
      !newMember.team ||
      !newMember.email
    ) {
      alert("Fill all fields");
      return;
    }

    setMembers([
      ...members,
      {
        id: Date.now(),
        ...newMember,
      },
    ]);

    setNewMember({
      name: "",
      role: "",
      team: "",
      email: "",
      status: "Active",
    });
  };

  const deleteMember = (id) => {
    setMembers(members.filter((member) => member.id !== id));
  };

  return (
    <div className="teams-page">
      <div className="teams-header">
        <h1>Teams Management</h1>
      </div>

      {/* Add Member Form */}

      <div className="member-form">
        <input
          type="text"
          placeholder="Member Name"
          value={newMember.name}
          onChange={(e) =>
            setNewMember({
              ...newMember,
              name: e.target.value,
            })
          }
        />

        <input
          type="text"
          placeholder="Role"
          value={newMember.role}
          onChange={(e) =>
            setNewMember({
              ...newMember,
              role: e.target.value,
            })
          }
        />

        <input
          type="text"
          placeholder="Team"
          value={newMember.team}
          onChange={(e) =>
            setNewMember({
              ...newMember,
              team: e.target.value,
            })
          }
        />

        <input
          type="email"
          placeholder="Email"
          value={newMember.email}
          onChange={(e) =>
            setNewMember({
              ...newMember,
              email: e.target.value,
            })
          }
        />

        <select
          value={newMember.status}
          onChange={(e) =>
            setNewMember({
              ...newMember,
              status: e.target.value,
            })
          }
        >
          <option>Active</option>
          <option>Inactive</option>
        </select>

        <button
          className="add-member-btn"
          onClick={addMember}
        >
          Add Member
        </button>
      </div>

      {/* Stats */}

      <div className="team-stats">
        <div className="stat-card">
          <h3>Total Employees</h3>
          <p>{members.length}</p>
        </div>

        <div className="stat-card">
          <h3>Active Members</h3>
          <p>
            {
              members.filter(
                (member) =>
                  member.status === "Active"
              ).length
            }
          </p>
        </div>

        <div className="stat-card">
          <h3>Inactive Members</h3>
          <p>
            {
              members.filter(
                (member) =>
                  member.status === "Inactive"
              ).length
            }
          </p>
        </div>
      </div>

      {/* Search */}

      <div className="search-section">
        <input
          type="text"
          placeholder="Search Member..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />
      </div>

      {/* Members */}

      <div className="members-grid">
        {members
          .filter((member) =>
            member.name
              .toLowerCase()
              .includes(search.toLowerCase())
          )
          .map((member) => (
            <div
              className="member-card"
              key={member.id}
            >
              <h2>{member.name}</h2>

              <p>
                <strong>Role:</strong>{" "}
                {member.role}
              </p>

              <p>
                <strong>Team:</strong>{" "}
                {member.team}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {member.email}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {member.status}
              </p>

              <div className="member-actions">
                <button className="edit-btn">
                  Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() =>
                    deleteMember(member.id)
                  }
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Teams;