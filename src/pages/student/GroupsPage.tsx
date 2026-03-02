import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { studyGroupDB, groupMessageDB, subjectDB, userDB } from '@/services/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  ChevronLeft,
  Users,
  MessageCircle,
  Plus,
  Send,
  UserPlus,
  Search,
  BookOpen,
} from 'lucide-react';
import type { StudyGroup, Subject, GroupMessage } from '@/types';

const GroupsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', subjectId: '' });

  useEffect(() => {
    if (user) {
      setGroups(studyGroupDB.getByMember(user.id));
    }
    setSubjects(subjectDB.getAll());
  }, [user]);

  useEffect(() => {
    if (selectedGroup) {
      setMessages(groupMessageDB.getByGroup(selectedGroup.id));
    }
  }, [selectedGroup]);

  const createGroup = () => {
    if (!user || !newGroup.name || !newGroup.subjectId) return;

    const group: StudyGroup = {
      id: `group_${Date.now()}`,
      name: newGroup.name,
      description: newGroup.description,
      subjectId: newGroup.subjectId,
      createdBy: user.id,
      members: [{ userId: user.id, role: 'admin', joinedAt: new Date() }],
      createdAt: new Date(),
      maxMembers: 50,
    };

    studyGroupDB.create(group);
    setGroups([...groups, group]);
    setShowCreateForm(false);
    setNewGroup({ name: '', description: '', subjectId: '' });
    toast.success('Group created!');
  };

  const joinGroup = (groupId: string) => {
    if (!user) return;

    const group = studyGroupDB.getById(groupId);
    if (!group) return;

    if (group.members.length >= group.maxMembers) {
      toast.error('Group is full');
      return;
    }

    if (group.members.some((m) => m.userId === user.id)) {
      toast.error('Already a member');
      return;
    }

    const updated = studyGroupDB.update(groupId, {
      members: [...group.members, { userId: user.id, role: 'member', joinedAt: new Date() }],
    });

    if (updated) {
      setGroups([...groups, updated]);
      toast.success('Joined group!');
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedGroup || !user) return;

    const message: GroupMessage = {
      id: `msg_${Date.now()}`,
      groupId: selectedGroup.id,
      userId: user.id,
      message: newMessage,
      sentAt: new Date(),
    };

    groupMessageDB.create(message);
    setMessages([...messages, message]);
    setNewMessage('');
  };

  const allGroups = studyGroupDB.getAll();
  const availableGroups = allGroups.filter(
    (g) => !g.members.some((m) => m.userId === user?.id)
  );

  if (selectedGroup) {
    const subject = subjects.find((s) => s.id === selectedGroup.subjectId);
    
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedGroup(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="font-bold">{selectedGroup.name}</h1>
                  <p className="text-xs text-gray-500">{subject?.name} • {selectedGroup.members.length} members</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No messages yet</p>
                  <p className="text-sm">Be the first to start the conversation!</p>
                </div>
              )}

              {messages.map((msg) => {
                const sender = userDB.getById(msg.userId);
                const isMe = msg.userId === user?.id;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : ''}`}>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={sender?.avatar} />
                        <AvatarFallback>{sender?.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className={`text-xs text-gray-500 mb-1 ${isMe ? 'text-right' : ''}`}>
                          {sender?.name}
                        </p>
                        <div className={`rounded-2xl px-4 py-2 ${
                          isMe ? 'bg-blue-500 text-white rounded-tr-sm' : 'bg-white border rounded-tl-sm'
                        }`}>
                          <p>{msg.message}</p>
                        </div>
                        <p className={`text-xs text-gray-400 mt-1 ${isMe ? 'text-right' : ''}`}>
                          {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <div className="bg-white border-t">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/student/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <Users className="w-6 h-6 text-blue-500" />
              <span className="text-xl font-bold">Study Groups</span>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {showCreateForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Group</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    placeholder="Group name"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  />
                  <Input
                    placeholder="Description"
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  />
                  <select
                    value={newGroup.subjectId}
                    onChange={(e) => setNewGroup({ ...newGroup, subjectId: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowCreateForm(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button
                      onClick={createGroup}
                      disabled={!newGroup.name || !newGroup.subjectId}
                      className="flex-1"
                    >
                      Create
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Groups */}
          <div>
            <h2 className="text-lg font-semibold mb-4">My Groups</h2>
            {groups.length > 0 ? (
              <div className="space-y-3">
                {groups.map((group) => {
                  const subject = subjects.find((s) => s.id === group.subjectId);
                  return (
                    <motion.div
                      key={group.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => setSelectedGroup(group)}
                      className="p-4 bg-white rounded-xl border cursor-pointer hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{group.name}</h3>
                          <p className="text-sm text-gray-500">{group.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              {subject?.name}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {group.members.length}
                            </Badge>
                          </div>
                        </div>
                        <MessageCircle className="w-5 h-5 text-gray-400" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>You're not in any groups yet</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Available Groups */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Discover Groups</h2>
            {availableGroups.length > 0 ? (
              <div className="space-y-3">
                {availableGroups.map((group) => {
                  const subject = subjects.find((s) => s.id === group.subjectId);
                  return (
                    <motion.div
                      key={group.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 bg-white rounded-xl border"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{group.name}</h3>
                          <p className="text-sm text-gray-500">{group.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{subject?.name}</Badge>
                            <span className="text-sm text-gray-500">{group.members.length} members</span>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => joinGroup(group.id)}>
                          <UserPlus className="w-4 h-4 mr-1" />
                          Join
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No groups available to join</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GroupsPage;
